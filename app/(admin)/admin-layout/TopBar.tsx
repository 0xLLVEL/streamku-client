'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { logoutAction } from '@/app/actions/auth';
import { ChevronIcon, MenuIcon } from './icons';

export function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/admin/content?search=${encodeURIComponent(trimmed)}` : '/admin/content');
  };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={onMenuClick} aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring">
          <MenuIcon />
        </button>
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <form onSubmit={handleSearch} className="relative w-48 sm:w-64 lg:w-72 hidden md:block" role="search">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles..." aria-label="Search titles"
            className="w-full h-9 bg-black/30 border border-white/10 rounded-lg pl-10 pr-3 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50" />
        </form>
        <div className="relative" ref={profileRef}>
          <button type="button" onClick={() => setProfileOpen((o) => !o)} aria-expanded={profileOpen} aria-haspopup="menu"
            className="flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring">
            <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{user?.name?.charAt(0) ?? 'A'}</span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[13px] font-semibold text-white max-w-[140px] truncate">{user?.name}</span>
              <span className="text-[10px] text-white/40">Admin</span>
            </span>
            <ChevronIcon className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
          </button>
          {profileOpen && (
            <div role="menu" className="absolute right-0 top-full mt-2 w-48 bg-[#101014] border border-white/10 rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
              </div>
              <form action={logoutAction}>
                <button type="submit" role="menuitem" className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring">Sign out</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
