'use client';

import Image from 'next/image';
import { PlayAction } from '@/components/media/PlayAction';
import { DraggableList } from '@/components/media/DraggableList';
import { tmdbImageUrl } from '@/lib/config';

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
    slug: string;
    season_number?: number;
    episode_number?: number;
    tv_show_name?: string;
  };
}

interface ContinueWatchingRowProps {
  items: HistoryItem[];
}

export function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
      <DraggableList className="pb-4" innerClassName="space-x-4">
        {items.map((history) => {
          if (!history.item) return null;
          
          const estimated = history.media_type === 'movie' ? 7200 : 1440;
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
            <div key={history.id} className="relative snap-start shrink-0 w-[200px] md:w-[240px] flex flex-col group cursor-pointer transition-all duration-300">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1e1e24] border border-white/5 shadow-sm group-hover:border-white/20 transition-all">
                {history.item.poster_path ? (
                  <Image
                    src={tmdbImageUrl(history.item.poster_path, 'w342') ?? ''}
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 768px) 200px, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-medium">
                    No Image
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayAction
                    mediaEndpoint={endpoint}
                    title={displayTitle}
                    poster={tmdbImageUrl(history.item.poster_path, 'w342') ?? ''}
                    type={isMovie ? 'movie' : 'tv'}
                    watchableId={history.item.id}
                    initialTime={history.progress_seconds}
                    className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 hover:scale-110 transition-all shadow-lg"
                    icon={<svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    label=""
                  />
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-2.5 px-0.5">
                <h3 className="text-white/90 font-medium text-sm line-clamp-1 group-hover:text-red-400 transition-colors" title={displayTitle}>
                  {displayTitle}
                </h3>
                {!isMovie && (
                  <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{history.item.title}</p>
                )}
              </div>
            </div>
          );
        })}
      </DraggableList>
    </div>
  );
}
