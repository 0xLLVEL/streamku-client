'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { logoutAction } from '@/app/actions/auth';
import { useEffect, useState } from 'react';
import { avatarUrl } from '@/lib/config.utils';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Movies', path: '/movies' },
  { name: 'TV Series', path: '/tv' },
  { name: 'Genres', path: '/genres' },
  { name: 'Library', path: '/profile/me' },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    setIsMobileMenuOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q as string)}`);
  };

  return (
    <div className="fixed inset-x-0 top-3 z-50 flex flex-col items-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex h-14 w-full max-w-4xl items-center justify-between gap-2 rounded-full liquid-glass px-3 transition-all duration-300 ${isScrolled ? 'bg-black/30 shadow-black/50' : 'shadow-black/30'}`}
        aria-label="Main"
      >
        <div className="flex items-center gap-1">
          <Link href="/" className="text-xl font-black text-red-600 tracking-tighter pr-1" aria-label="Streamku home">
            STREAMKU
          </Link>
          <button
            className="lg:hidden p-2 rounded-full text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:text-red-400"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
            </svg>
          </button>
          <div className="hidden lg:flex items-center gap-0.5 text-sm font-semibold">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path + '/'));
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap px-3 py-2 rounded-full transition-colors ${active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <form onSubmit={handleSearch} className="relative hidden sm:flex items-center">
            <input
              type="text"
              name="q"
              placeholder="Search"
              aria-label="Search titles, people, genres"
              className="w-9 focus:w-32 xl:focus:w-44 transition-all duration-300 bg-transparent hover:bg-white/10 focus:bg-white/10 text-sm text-white p-2.5 pl-9 rounded-full outline-none placeholder-transparent focus:placeholder-white/40 cursor-pointer focus:cursor-text"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 absolute left-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>

          {!loading && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:ring-2 hover:ring-white/30 transition-all"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                <span aria-hidden className="flex w-full h-full items-center justify-center">
                  {user.avatar ? <img src={avatarUrl(user.avatar) ?? ''} alt="" className="w-full h-full object-cover" /> : (user.nickname || (user as unknown as { username?: string }).username || user.name || 'U').charAt(0).toUpperCase()}
                </span>
              </button>
              {isUserMenuOpen && (
                <>
                  <button className="fixed inset-0 z-40" aria-label="Close menu" onClick={() => setIsUserMenuOpen(false)} tabIndex={-1} />
                  <div className="absolute right-0 mt-3 w-56 bg-popover/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50 border border-border" role="menu">
                    <div className="px-4 py-3 border-b border-border mb-1">
                      <p className="text-sm font-bold text-popover-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {user?.is_admin && (
                      <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile/me" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">My Library</Link>
                    <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">Account Settings</Link>
                    <div className="h-px bg-border my-1" />
                    <form action={logoutAction}>
                      <button type="submit" role="menuitem" className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10">Sign Out</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="ml-1 px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors">Sign In</Link>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="lg:hidden w-full max-w-md mt-2 bg-popover/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden z-40 pointer-events-auto">
          <form onSubmit={handleSearch} className="px-4 py-3 border-b border-border">
            <div className="relative">
              <svg className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="q" placeholder="Search titles, people, genres" aria-label="Search" className="w-full bg-muted border border-input rounded-lg pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
            </div>
          </form>
          <div className="flex flex-col py-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path + '/'));
              return (
                <Link key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`px-6 py-3 font-medium ${active ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
