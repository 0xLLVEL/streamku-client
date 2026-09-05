'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { ChevronIcon, FilmIcon, LayoutIcon, LogoutIcon } from './icons';

export function Sidebar({ pathname, userName, open }: { pathname: string; userName: string; open: boolean }) {
  const [contentOpen, setContentOpen] = useState(true);
  const contentActive =
    pathname.startsWith('/admin/content') ||
    pathname.startsWith('/admin/movies') ||
    pathname.startsWith('/admin/tv-shows') ||
    pathname.startsWith('/admin/cast') ||
    pathname.startsWith('/admin/genres') ||
    pathname.startsWith('/admin/reviews') ||
    pathname.startsWith('/admin/comments');
  const isDashboard = pathname === '/admin';
  const contentItems = [
    { name: 'Titles', path: '/admin/content', exact: true },
    { name: 'Cast', path: '/admin/cast' },
    { name: 'Genres', path: '/admin/genres' },
    { name: 'Reviews', path: '/admin/reviews' },
    { name: 'Comments', path: '/admin/comments' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0C0C0E] border-r border-white/10 flex flex-col h-screen overflow-y-auto custom-scrollbar transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-20 flex items-center px-6 shrink-0 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 cursor-pointer rounded-lg" aria-label="Back to site">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(220,38,38,0.35)]">S</div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[15px] tracking-wide text-white">Streamku</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">Admin Panel</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1" aria-label="Admin navigation">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-3 mb-2">Main Menu</h3>
        <SidebarLink href="/admin" active={isDashboard} icon={<LayoutIcon />}>Dashboard</SidebarLink>
        <div>
          <button type="button" onClick={() => setContentOpen((o) => !o)} aria-expanded={contentOpen}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${contentActive && !isDashboard ? 'bg-red-600/15 text-red-400' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
            <span className={`${contentActive && !isDashboard ? 'text-red-400' : 'text-white/40'} transition-colors duration-200`}><FilmIcon /></span>
            <span className="flex-1 text-left">Content</span>
            <ChevronIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`} />
          </button>
          {contentOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-white/5 flex flex-col gap-0.5">
              {contentItems.map((item) => {
                const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
                return (
                  <Link key={item.path} href={item.path} aria-current={active ? 'page' : undefined}
                    className={`relative block px-3 py-2 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${active ? 'text-red-400' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}>
                    {active && <span aria-hidden className="absolute -left-[17px] top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-red-500" />}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-white/5 shrink-0">
        <form action={logoutAction} className="w-full">
          <button type="submit" className="group flex items-center justify-between w-full px-3 py-3 rounded-lg bg-black/30 text-white/60 hover:text-white hover:bg-black/50 border border-white/5 hover:border-white/10 transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-red-600/15 text-red-400 flex items-center justify-center text-sm font-bold">{userName.charAt(0)}</div>
              <div className="flex flex-col items-start">
                <span className="truncate max-w-[100px] text-white">{userName}</span>
                <span className="text-[10px] text-white/40">Admin</span>
              </div>
            </div>
            <LogoutIcon />
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${active ? 'bg-red-600/15 text-red-400' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
      <span className={`${active ? 'text-red-400' : 'text-white/40'} transition-colors duration-200`}>{icon}</span>
      {children}
    </Link>
  );
}
