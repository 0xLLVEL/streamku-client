'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useIsClient } from '@/hooks/use-is-client';
import { Sidebar } from './admin-layout/Sidebar';
import { TopBar } from './admin-layout/TopBar';
import { isImmersiveRoute, pageTitle } from './admin-layout/route-titles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const isClient = useIsClient();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) router.replace('/');
  }, [user, loading, router]);

  // Close the mobile drawer on navigation during render so React bails out before paint.
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
      {sidebarOpen && <div aria-hidden onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />}
      <Sidebar pathname={pathname} userName={user.name ?? 'Admin'} open={sidebarOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {!immersive && <TopBar title={pageTitle(pathname)} onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 sm:p-6 lg:p-8 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
