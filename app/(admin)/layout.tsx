'use client';

import { useAuth } from '@/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { useIsClient } from '@/hooks/useIsClient';

function pageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/content') return 'Titles';
  if (pathname === '/admin/content/create') return 'Add Title';
  if (pathname === '/admin/cast') return 'Cast';
  if (pathname.startsWith('/admin/cast/')) return 'Edit Cast';
  if (pathname === '/admin/genres') return 'Genres';
  if (pathname.startsWith('/admin/genres/')) return 'Edit Genre';
  if (pathname.startsWith('/admin/movies/create')) return 'Create Movie';
  if (pathname.startsWith('/admin/movies/')) return 'Edit Movie';
  if (pathname.startsWith('/admin/tv-shows/create')) return 'Create TV Show';
  if (pathname.startsWith('/admin/tv-shows/')) return 'Edit TV Show';
  return 'Admin';
}

/** Full-height editor shells (EditFormShell) render their own chrome. */
function isImmersiveRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/movies/') || pathname.startsWith('/admin/tv-shows/');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  const isClient = useIsClient();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Close the mobile drawer on navigation. Adjust state during render
  // instead of in an effect so React can bail out before the next paint.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setSidebarOpen(false);
  }

  if (!isClient || loading || !user || !user.is_admin) {
    return <div className="min-h-screen bg-[#060607] flex items-center justify-center text-white">Authenticating...</div>;
  }

  const immersive = isImmersiveRoute(pathname);

  return (
    <div className="min-h-screen flex bg-[#060607] text-white font-sans overflow-hidden">

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar pathname={pathname} userName={user.name} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {!immersive && <TopBar title={pageTitle(pathname)} onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 sm:p-6 lg:p-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ Sidebar ------------------------------ */

function Sidebar({
  pathname,
  userName,
  open,
  onClose,
}: {
  pathname: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [contentOpen, setContentOpen] = useState(true);
  const contentActive =
    pathname.startsWith('/admin/content') ||
    pathname.startsWith('/admin/movies') ||
    pathname.startsWith('/admin/tv-shows') ||
    pathname.startsWith('/admin/cast') ||
    pathname.startsWith('/admin/genres');
  const isDashboard = pathname === '/admin';

  const contentItems = [
    { name: 'Titles', path: '/admin/content', exact: true },
    { name: 'Cast', path: '/admin/cast' },
    { name: 'Genres', path: '/admin/genres' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0C0C0E] border-r border-white/10 flex flex-col h-screen overflow-y-auto custom-scrollbar transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo Header */}
      <div className="h-20 flex items-center px-6 shrink-0 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 cursor-pointer rounded-lg" aria-label="Back to site">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(220,38,38,0.35)]">
            S
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[15px] tracking-wide text-white">Streamku</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1" aria-label="Admin navigation">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-3 mb-2">Main Menu</h3>

        <SidebarLink href="/admin" active={isDashboard} icon={<LayoutIcon />}>
          Dashboard
        </SidebarLink>

        {/* Collapsible Content group */}
        <div>
          <button
            type="button"
            onClick={() => setContentOpen((open) => !open)}
            aria-expanded={contentOpen}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${
              contentActive && !isDashboard ? 'bg-red-600/15 text-red-400' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className={`${contentActive && !isDashboard ? 'text-red-400' : 'text-white/40'} transition-colors duration-200`}>
              <FilmIcon />
            </span>
            <span className="flex-1 text-left">Content</span>
            <ChevronIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`} />
          </button>

          {contentOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-white/5 flex flex-col gap-0.5">
              {contentItems.map((item) => {
                const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`relative block px-3 py-2 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${
                      active
                        ? 'text-red-400'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-[17px] top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-red-500"
                      />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="group flex items-center justify-between w-full px-3 py-3 rounded-lg bg-black/30 text-white/60 hover:text-white hover:bg-black/50 border border-white/5 hover:border-white/10 transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring"
          >
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

function SidebarLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${
        active ? 'bg-red-600/15 text-red-400' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      <span className={`${active ? 'text-red-400' : 'text-white/40'} transition-colors duration-200`}>{icon}</span>
      {children}
    </Link>
  );
}

/* ------------------------------ Top bar ------------------------------ */

function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/admin/content?search=${encodeURIComponent(trimmed)}` : '/admin/content');
  };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md z-20">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring"
        >
          <MenuIcon />
        </button>
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global search — lands on the titles list */}
        <form onSubmit={handleSearch} className="relative w-48 sm:w-64 lg:w-72 hidden md:block" role="search">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles..."
            aria-label="Search titles"
            className="w-full h-9 bg-black/30 border border-white/10 rounded-lg pl-10 pr-3 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50"
          />
        </form>

        {/* Profile chip */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring"
          >
            <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0) ?? 'A'}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[13px] font-semibold text-white max-w-[140px] truncate">{user?.name}</span>
              <span className="text-[10px] text-white/40">Admin</span>
            </span>
            <ChevronIcon className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 bg-[#101014] border border-white/10 rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)] overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------ Icons ------------------------------ */

function LayoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ChevronIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4 text-white/30 transition-colors duration-200 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
