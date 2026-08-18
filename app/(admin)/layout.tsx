'use client';

import { useAuth } from '@/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { logoutAction } from '@/app/actions/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !user.is_admin) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Authenticating...</div>;
  }

  const navSections = [
    {
      title: 'Content',
      items: [
        { name: 'Dashboard', path: '/admin', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> },
        { name: 'Movies', path: '/admin/movies', addPath: '/admin/movies/create', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg> },
        { name: 'TV Shows', path: '/admin/tv-shows', addPath: '/admin/tv-shows/create', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> },
        { name: 'Cast', path: '/admin/cast', addPath: '/admin/cast/create', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> },
        { name: 'Genres', path: '/admin/genres', addPath: '/admin/genres/create', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg> },
        { name: 'Videos', path: '/admin/videos', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> },
        { name: 'Reviews', path: '/admin/reviews', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg> },
        { name: 'Comments', path: '/admin/comments', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg> },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      {/* Single Unified Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col shrink-0 relative z-30 h-screen overflow-y-auto custom-scrollbar">
        {/* Logo Header */}
        <div className="h-20 flex items-center px-6 shrink-0 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-lg tracking-wide text-white">Streamku</span>
            <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">ADMIN</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-8">
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-1">{section.title}</h3>
              <div className="flex flex-col gap-1">
                {section.items.map((item: any) => {
                  const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
                  return (
                    <div key={item.path} className="flex items-center group relative">
                      <Link
                        href={item.path}
                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-[13px] font-medium ${isActive
                            ? 'bg-red-500/10 text-red-500 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <span className={`${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'}`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                      {item.addPath && (
                        <Link 
                          href={item.addPath}
                          className={`absolute right-2 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${isActive ? 'text-red-500 hover:bg-red-500/20 opacity-100' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                          title={`Add ${item.name}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 shrink-0">
           <form action={async () => { await logoutAction(); }} className="w-full">
            <button type="submit" className="flex items-center justify-between w-full px-3 py-3 rounded-lg bg-[#000000] text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors text-[13px] font-medium group">
               <div className="flex items-center gap-3">
                 <div className="w-7 h-7 rounded bg-red-600/20 text-red-500 flex items-center justify-center text-sm font-bold">{user.name.charAt(0)}</div>
                 <div className="flex flex-col items-start">
                   <span className="truncate max-w-[100px] text-white">{user.name}</span>
                   <span className="text-[10px] text-gray-500">Admin</span>
                 </div>
               </div>
               <svg className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-screen bg-[#000000]">
        <div className="p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
