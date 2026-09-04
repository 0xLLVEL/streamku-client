import Link from 'next/link';
import Image from 'next/image';

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
    <Link
      href={href}
      aria-label={`${displayTitle}${item.release_date || item.first_air_date ? `, ${(item.release_date || item.first_air_date)!.substring(0, 4)}` : ''}${(item.vote_average ?? 0) > 0 ? `, rating ${Number(item.vote_average).toFixed(1)}` : ''}`}
      className="group flex flex-col w-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted border border-border shadow-sm group-hover:border-ring/30 group-hover:shadow-md transition-all">
        {item.poster_path ? (
          <Image
            src={tmdbImageUrl(item.poster_path, 'w342') ?? ''}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
            No poster
          </div>
        )}
      </div>
      
      <div className="mt-2.5 px-1">
        <h3 className="text-foreground font-medium text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors" title={displayTitle ?? ''}>
          {displayTitle}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {item.release_date || item.first_air_date ? (
            <span className="tabular-nums">{((item.release_date || item.first_air_date) as string).substring(0, 4)}</span>
          ) : null}
          {(item.vote_average ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="tabular-nums">{Number(item.vote_average).toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
