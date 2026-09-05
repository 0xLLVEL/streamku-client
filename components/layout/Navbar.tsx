'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { logoutAction } from '@/app/actions/auth';
import { useState } from 'react';
import { avatarUrl } from '@/lib/config.utils';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Movies', path: '/movies' },
  { name: 'TV Series', path: '/tv' },
  { name: 'Genres', path: '/genres' },
  { name: 'Library', path: '/profile/me' },
];

const iconButtonClass = 'p-2.5 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none';

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    setIsMobileMenuOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q as string)}`);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4">
      <header className="flex w-full justify-center py-4">
        <nav
          aria-label="Main"
          className="pointer-events-auto relative inline-flex items-center gap-1 overflow-visible rounded-full bg-black/20 px-1.5 py-1.5 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
        >
          <Link href="/" className="mr-1 flex items-center px-2" aria-label="Streamku home">
            <span className="text-xl font-black tracking-tighter text-red-600">STREAMKU</span>
          </Link>

          <div className="hidden items-center sm:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path + '/'));
              return (
                <Link key={link.name} href={link.path} aria-current={active ? 'page' : undefined} className="relative px-4 py-2">
                  <span className={`relative z-10 text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                    {link.name}
                  </span>
                  <div className={`absolute inset-0 rounded-full bg-white/15 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1 px-1">
            <button
              className={`${iconButtonClass} sm:hidden`}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
              </svg>
            </button>

            <form onSubmit={handleSearch} className="relative hidden items-center sm:flex">
              <input
                type="text"
                name="q"
                placeholder="Search"
                aria-label="Search titles, people, genres"
                className="w-9 cursor-pointer rounded-full bg-transparent p-2.5 pl-9 text-sm text-white outline-none transition-all duration-300 placeholder-transparent hover:bg-white/10 focus:w-32 focus:cursor-text focus:bg-white/10 focus:placeholder-white/40 xl:focus:w-44"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-2 size-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </form>

            {!loading && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-sm font-bold text-white transition-all hover:ring-2 hover:ring-white/30"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                >
                  <span aria-hidden className="relative flex h-full w-full items-center justify-center">
                    {user.avatar ? <Image src={avatarUrl(user.avatar) ?? ''} alt="" fill sizes="36px" unoptimized className="object-cover" /> : (user.nickname || (user as unknown as { username?: string }).username || user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <>
                    <button className="fixed inset-0 z-40" aria-label="Close menu" onClick={() => setIsUserMenuOpen(false)} tabIndex={-1} />
                    <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-border bg-popover/95 py-2 shadow-xl backdrop-blur-xl" role="menu">
                      <div className="mb-1 border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-bold text-popover-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {user?.is_admin && (
                        <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/profile/me" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">My Library</Link>
                      <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Account Settings</Link>
                      <div className="my-1 h-px bg-border" />
                      <form action={logoutAction}>
                        <button type="submit" role="menuitem" className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-500/10">Sign Out</button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              !loading && (
                <Link href="/login" className="ml-1 whitespace-nowrap rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/25">Sign In</Link>
              )
            )}
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div className="pointer-events-auto z-40 mt-0 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl sm:hidden">
          <form onSubmit={handleSearch} className="border-b border-border px-4 py-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="q" placeholder="Search titles, people, genres" aria-label="Search" className="w-full rounded-lg border border-input bg-muted py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
            </div>
          </form>
          <div className="flex flex-col py-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path + '/'));
              return (
                <Link key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`px-6 py-3 font-medium ${active ? 'bg-muted text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
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
