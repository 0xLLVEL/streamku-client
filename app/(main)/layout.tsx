'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { logoutAction } from '@/app/actions/auth';
import { useActionState, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [state, formAction] = useActionState(logoutAction, null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (state?.success) {
    window.location.href = '/login';
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q as string)}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Genres', path: '/genres' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0a] to-[#0a0a0a]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full transition-all duration-500 pointer-events-none" style={{ paddingTop: isScrolled ? '1rem' : '0' }}>
        <nav
          className={`pointer-events-auto transition-all duration-500 flex items-center justify-between px-6 mx-4 w-full md:max-w-[1400px]
            ${isScrolled
              ? 'liquid-glass rounded-full shadow-2xl h-14'
              : 'bg-transparent border border-transparent shadow-none h-20'
            }`}
        >
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-3xl font-black text-red-600 tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              STREAMKU
            </Link>

            {/* Nav Links with new cinematic font style */}
            <div className="hidden md:flex space-x-2 text-[0.95rem] tracking-wide font-sans relative">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path + '/'));
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`relative px-5 py-2 font-medium drop-shadow-lg transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10 rounded-full'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 liquid-glass rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Expandable Search Bar */}
            <form onSubmit={handleSearch} className="relative flex items-center group">
              <input
                type="text"
                name="q"
                placeholder="Titles, people, genres"
                className="w-10 focus:w-64 transition-all duration-500 ease-out bg-transparent focus:bg-white/10 border border-transparent focus:border-white/20 hover:bg-white/10 text-sm text-white pl-10 pr-4 py-2 rounded-full outline-none placeholder-transparent focus:placeholder-white/40 cursor-pointer focus:cursor-text"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white absolute left-2.5 pointer-events-none drop-shadow-md"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {!loading && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-colors font-semibold"
                >
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{user.name}</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-48 liquid-glass rounded-2xl shadow-2xl py-2 z-50 border border-white/20 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                      {user?.is_admin && (
                        <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-5 py-3 text-sm font-bold text-red-400 hover:bg-white/10 transition-colors border-b border-white/10">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                        Settings
                      </Link>
                      <form action={formAction}>
                        <button type="submit" className="w-full text-left block px-5 py-3 text-sm font-bold text-red-400 hover:bg-white/10 transition-colors">
                          Logout
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 shadow-lg text-sm font-bold text-white transition-all">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="pt-0">
        {children}
      </main>
    </div>
  );
}
