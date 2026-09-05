import Link from 'next/link';
import type { HeroMetaProps } from './types';

export function HeroMeta({ item }: HeroMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base md:text-lg font-semibold text-white/80 mb-4 drop-shadow">
      {(item.vote_average ?? 0) > 0 && (
        <span className="flex items-center text-yellow-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          {Number(item.vote_average).toFixed(1)}
        </span>
      )}
      {item.release_date || item.first_air_date ? (
        <>
          <span>{new Date((item.release_date || item.first_air_date) as string).getFullYear()}</span>
          <span className="text-white/40">•</span>
        </>
      ) : null}
      {(item.runtime ?? 0) > 0 ? (
        <>
          <span>{Math.floor(item.runtime! / 60)}h {item.runtime! % 60}m</span>
          <span className="text-white/40">•</span>
        </>
      ) : item.episode_run_time?.[0] ? (
        <>
          <span>{item.episode_run_time[0]}m</span>
          <span className="text-white/40">•</span>
        </>
      ) : null}
      {item.genres && item.genres.length > 0 && (
        <span className="text-white/60">
          {item.genres.slice(0, 3).map((g, idx, arr) => (
            <span key={g.id}>
              <Link href={`/genres/${g.slug}`} className="hover:text-white transition-colors cursor-pointer">
                {g.name}
              </Link>
              {idx < arr.length - 1 && ', '}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
