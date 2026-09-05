/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config.utils';
import { apiFetch } from '@/lib/api-client.utils';
import type { MediaListItem } from '@/app/(main)/profile/profile-types';

type Tab = 'watchlist' | 'favorites' | 'history' | 'reviews' | 'comments';

interface HistoryItem {
  id: number;
  media_type: string;
  progress_seconds: number;
  duration_seconds: number;
  item: { id: number; title: string; poster_path: string; backdrop_path?: string | null; slug: string; season_number?: number; episode_number?: number; tv_show_name?: string };
}

interface Review {
  id: number;
  rating: number;
  body: string | null;
  media_type: string;
  media_id: number;
  created_at: string;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'watchlist', label: 'Watchlist', icon: 'M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' },
  { id: 'favorites', label: 'Favorites', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { id: 'history', label: 'History', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
  { id: 'reviews', label: 'Reviews', icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
  { id: 'comments', label: 'Comments', icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
];

function Grid({ items, emptyIcon, emptyTitle, emptyDesc }: { items: MediaListItem[]; emptyIcon: string; emptyTitle: string; emptyDesc: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-3xl liquid-glass border-white/5 text-center">
        <svg className="h-16 w-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={emptyIcon} /></svg>
        <h3 className="text-xl font-bold text-white mb-2">{emptyTitle}</h3>
        <p className="text-white/50 max-w-md">{emptyDesc}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {items.map((item) => {
        const d = item.media_details;
        const link = item.media_type === 'movie' ? `/movie/${d?.slug}` : `/tv/${d?.slug}`;
        const poster = d?.poster_path ? tmdbImageUrl(d.poster_path, 'w342') : null;
        return (
          <Link key={item.id} href={link} className="group">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
              {poster ? <Image src={poster} alt={d?.title || ''} fill sizes="180px" className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">No Image</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white font-bold text-sm truncate">{d?.title}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function LibraryTabs({ initialWatchlist, initialFavorites }: { initialWatchlist: MediaListItem[]; initialFavorites: MediaListItem[] }) {
  const [tab, setTab] = useState<Tab>('watchlist');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'history' && history.length === 0) {
      setLoading(true);
      apiFetch('/history/continue-watching').then(r => r.json()).then(j => setHistory(j.data || j || [])).catch(() => {}).finally(() => setLoading(false));
    }
    if (tab === 'reviews' && reviews.length === 0) {
      setLoading(true);
      apiFetch('/reviews').then(r => r.json()).then(j => setReviews(j.data?.data || j.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
    if (tab === 'comments' && comments.length === 0) {
      setLoading(true);
      // No dedicated my-comments endpoint yet — show empty with CTA
      setLoading(false);
    }
  }, [tab, history.length, reviews.length, comments.length]);

  return (
    <div>
      <div role="tablist" aria-label="Library sections" className="flex gap-2 mb-8 overflow-x-auto scrollbar-none pb-2 border-b border-white/5">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            onKeyDown={e => {
              const idx = tabs.findIndex(x => x.id === t.id);
              if (e.key === 'ArrowRight') document.getElementById(`tab-${tabs[(idx+1)%tabs.length].id}`)?.focus();
              if (e.key === 'ArrowLeft') document.getElementById(`tab-${tabs[(idx-1+tabs.length)%tabs.length].id}`)?.focus();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${tab === t.id ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`}
          >
            <svg className="w-4 h-4" fill={tab === t.id ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-h-[240px]">
        {tab === 'watchlist' && <Grid items={initialWatchlist} emptyIcon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" emptyTitle="Watchlist empty" emptyDesc="Add movies and shows to watch later." />}
        {tab === 'favorites' && <Grid items={initialFavorites} emptyIcon="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" emptyTitle="No favorites yet" emptyDesc="Tap the heart on any title to save it." />}
      {tab === 'history' && (
        loading ? <p className="text-white/50">Loading history…</p> : history.length === 0 ? <div className="p-16 rounded-3xl liquid-glass text-center"><p className="text-white font-bold">No history yet</p><p className="text-white/50 text-sm mt-1">Start watching to see progress here.</p></div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(h => {
              const p = h.duration_seconds > 0 ? (h.progress_seconds / h.duration_seconds) * 100 : 0;
              const left = Math.max(0, (h.duration_seconds || 0) - h.progress_seconds);
              const leftStr = left <= 0 ? 'Finished' : left > 3600 ? `${Math.floor(left/3600)}h ${Math.floor((left%3600)/60)}m left` : `${Math.floor(left/60)}m left`;
              const thumb = h.item.backdrop_path ? tmdbImageUrl(h.item.backdrop_path, 'w500') : tmdbImageUrl(h.item.poster_path, 'w342');
              const href = h.media_type === 'movie' ? `/movie/${h.item.slug}` : `/tv/${h.item.slug}`;
              return (
                <Link key={h.id} href={href} className="flex gap-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/5 transition-colors group">
                  <div className="w-28 aspect-video rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                    {thumb ? <Image src={thumb} alt={h.item.title} fill className="object-cover" sizes="112px" /> : <div className="w-full h-full bg-white/5" />}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"><div className="h-full bg-red-600" style={{ width: `${Math.min(100, p)}%` }} /></div>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-red-400">{h.item.title}</p>
                    <p className="text-white/50 text-xs mt-1">{leftStr}</p>
                    <p className="text-white/30 text-[11px] mt-1">{new Date(h.item as unknown as string).toString().slice(0,10)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}
      {tab === 'reviews' && (
        loading ? <p className="text-white/50">Loading reviews…</p> : reviews.length === 0 ? <div className="p-16 rounded-3xl liquid-glass text-center"><p className="text-white font-bold">No reviews yet</p><p className="text-white/50 text-sm mt-1">Your reviews will appear here. Community reviews also show on title pages.</p></div> : (
          <div className="flex flex-col gap-3">
            {reviews.map((r: Review) => (
              <div key={r.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="flex items-center gap-2 mb-2"><span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}<span className="text-white/20">{'★'.repeat(10 - r.rating)}</span></span><span className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString()}</span></div>
                <p className="text-white/80 text-sm">{r.body || '—'}</p>
                <p className="text-white/30 text-xs mt-2 capitalize">{r.media_type} • {r.media_id}</p>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'comments' && (
        <div role="status" className="p-16 rounded-3xl liquid-glass text-center border border-white/5">
          <p className="text-white font-bold">Comments</p>
          <p className="text-white/50 text-sm mt-1">Your comment history will appear here. Join discussions on any title page.</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 rounded-full bg-white text-black text-sm font-bold">Browse titles</Link>
        </div>
      )}
      </div>
    </div>
  );
}
