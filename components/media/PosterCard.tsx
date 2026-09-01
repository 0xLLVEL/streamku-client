import Link from 'next/link';

import { MediaItem } from '@/types';
import { tmdbImageUrl } from '@/lib/config';

interface PosterCardProps {
  item: MediaItem;
  priority?: boolean;
}

export function PosterCard({ item, priority = false }: PosterCardProps) {
  const isMovie = !!item.title;
  const displayTitle = item.title || item.name;
  const href = isMovie ? `/movie/${item.slug}` : `/tv/${item.slug}`;

  return (
    <Link href={href} className="group flex flex-col w-[140px] md:w-[180px] flex-shrink-0 transition-all duration-300">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1e1e24] border border-white/5 shadow-sm group-hover:border-white/20 transition-all">
        {item.poster_path ? (
          <img
            src={tmdbImageUrl(item.poster_path, 'w342') ?? undefined}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-medium">
            No Image
          </div>
        )}
      </div>
      
      <div className="mt-2.5 px-0.5">
        <h3 className="text-white/90 font-medium text-sm line-clamp-1 group-hover:text-red-400 transition-colors" title={displayTitle}>
          {displayTitle}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-white/40">
          {item.release_date || item.first_air_date ? (
            <span>{((item.release_date || item.first_air_date) as string).substring(0, 4)}</span>
          ) : null}
          {(item.vote_average ?? 0) > 0 && (
            <span className="flex items-center text-yellow-500/80">
              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              {Number(item.vote_average).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
