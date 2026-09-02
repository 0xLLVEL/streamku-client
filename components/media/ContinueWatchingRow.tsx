'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayAction } from '@/components/media/PlayAction';
import { DraggableList } from '@/components/media/DraggableList';
import { tmdbImageUrl } from '@/lib/config';
import { apiFetch } from '@/lib/apiClient';

interface HistoryItem {
  id: number;
  media_type: 'movie' | 'episode';
  media_id: number;
  progress_seconds: number;
  duration_seconds: number;
  item: {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path?: string | null;
    slug: string;
    season_number?: number;
    episode_number?: number;
    tv_show_name?: string;
  };
}

interface ContinueWatchingRowProps {
  items: HistoryItem[];
}

export function ContinueWatchingRow({ items: initialItems }: ContinueWatchingRowProps) {
  const [items, setItems] = useState(initialItems);
  if (!items || items.length === 0) return null;

  const formatLeft = (progress: number, duration: number) => {
    const left = Math.max(0, duration - progress);
    if (left <= 0) return 'Finished';
    const h = Math.floor(left / 3600);
    const m = Math.floor((left % 3600) / 60);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  };

  const handleRemove = async (historyId: number, mediaType: string, mediaId: number) => {
    setItems(prev => prev.filter(h => h.id !== historyId));
    try {
      await apiFetch('history', {
        method: 'POST',
        body: JSON.stringify({ media_type: mediaType, media_id: mediaId, progress_seconds: 0, duration_seconds: 0, completed: true }),
      });
    } catch {}
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
      <DraggableList className="pb-4" innerClassName="space-x-4">
        {items.map((history) => {
          if (!history.item) return null;
           
          const estimated = history.media_type === 'movie' ? 7200 : 1440;
          const dur = history.duration_seconds > 0 ? history.duration_seconds : estimated;
          const raw = history.duration_seconds > 0 
            ? (history.progress_seconds / history.duration_seconds) * 100 
            : history.progress_seconds > 0 ? (history.progress_seconds / estimated) * 100 : 0;
          const progressPercent = history.progress_seconds > 0 ? Math.max(8, raw) : 0;
             
          const isMovie = history.media_type === 'movie';
          const endpoint = isMovie 
            ? `/movies/${history.item.slug}/media`
            : `/tv-shows/${history.item.slug}/seasons/${history.item.season_number}/episodes/${history.item.episode_number}/media`;

          const displayTitle = isMovie 
            ? history.item.title 
            : `${history.item.tv_show_name} - S${history.item.season_number} E${history.item.episode_number}`;

          return (
            <div key={history.id} className="relative snap-start shrink-0 w-[240px] md:w-[300px] flex flex-col group transition-all duration-300">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1e1e24] border border-white/10 shadow-lg group-hover:border-white/20 group-hover:shadow-xl group-hover:scale-[1.02] transition-all">
                {(() => {
                  const thumb = history.item.backdrop_path ? tmdbImageUrl(history.item.backdrop_path, 'w780') : tmdbImageUrl(history.item.poster_path, 'w342');
                  return thumb ? (
                    <Image
                      src={thumb}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 240px, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-medium">No Image</div>
                  );
                })()}
                 
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(history.id, history.media_type, history.media_id); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                 
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayAction
                    mediaEndpoint={endpoint}
                    title={displayTitle}
                    poster={tmdbImageUrl(history.item.poster_path, 'w342') ?? ''}
                    type={isMovie ? 'movie' : 'tv'}
                    watchableId={history.item.id}
                    initialTime={history.progress_seconds}
                    className="w-14 h-14 bg-red-600 rounded-full text-white hover:bg-red-500 hover:scale-110 transition-all shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center"
                    icon={<svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    label=""
                  />
                </div>
                 
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white tracking-wide">
                  {isMovie ? formatLeft(history.progress_seconds, dur) : `S${history.item.season_number} E${history.item.episode_number} • ${formatLeft(history.progress_seconds, dur)}`}
                </div>
                 
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                  <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }} />
                </div>
              </div>
               
              <div className="mt-2.5 px-0.5">
                <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-red-400 transition-colors" title={displayTitle}>{displayTitle}</h3>
                {!isMovie && <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{history.item.title}</p>}
              </div>
            </div>
          );
        })}
      </DraggableList>
    </div>
  );
}
