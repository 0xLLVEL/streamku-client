import { fetchApi } from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { MediaListItem, ProfileUser } from '../profile-types';
import { LibraryTabs } from '@/components/library/LibraryTabs';
import { avatarUrl } from '@/lib/config';

async function getUser(): Promise<ProfileUser | null> {
  try {
    const res = await fetchApi('/auth/me', { next: { revalidate: 0 } });
    if (res.ok) {
      const json = await res.json();
      return json.data?.user || json.user || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function getWatchlist(): Promise<MediaListItem[]> {
  try {
    const res = await fetchApi('/watchlist', { next: { revalidate: 0 } });
    if (res.ok) {
      const json = await res.json();
      return json.data?.data || json.data || [];
    }
  } catch {
    return [];
  }
  return [];
}

async function getFavorites(): Promise<MediaListItem[]> {
  try {
    const res = await fetchApi('/favorites', { next: { revalidate: 0 } });
    if (res.ok) {
      const json = await res.json();
      return json.data?.data || json.data || [];
    }
  } catch {
    return [];
  }
  return [];
}

export default async function MePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const [watchlist, favorites] = await Promise.all([getWatchlist(), getFavorites()]);

  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Banner */}
      <div className="h-48 md:h-56 w-full bg-gradient-to-br from-red-900/30 via-[#0a0a0a] to-indigo-900/20 border-b border-white/5" aria-hidden />

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-24">
        {/* Profile header — overlaps banner */}
        <div className="-mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-6 mb-10">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-4xl md:text-5xl shadow-2xl shrink-0 border-4 border-[#0a0a0a] ring-1 ring-white/10">
            {user.avatar ? <img src={avatarUrl(user.avatar) ?? ''} alt={`${user.name} avatar`} className="w-full h-full object-cover" /> : ((user.nickname || user.name) ?? 'U').charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{user.nickname ? `@${user.nickname}` : user.name}</h1>
              {user.is_admin && <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide">ADMIN</span>}
            </div>
            {user.nickname && <p className="text-white/60 mt-1">{user.name} • {user.email}</p>}
            {!user.nickname && <p className="text-white/60 mt-1">{user.email}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/40">
              {joined && <span>Joined {joined}</span>}
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-white/20" />{watchlist.length} watchlist</span>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-white/20" />{favorites.length} favorites</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href="/settings" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors">Edit profile</Link>
            <Link href="/settings" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-bold transition-colors">Settings</Link>
          </div>
        </div>

        <LibraryTabs initialWatchlist={watchlist} initialFavorites={favorites} />
      </div>
    </div>
  );
}