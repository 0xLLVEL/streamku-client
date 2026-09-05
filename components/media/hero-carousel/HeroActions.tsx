import Link from 'next/link';
import type { HeroActionsProps } from './types';

export function HeroActions({ slug, isMovie }: HeroActionsProps) {
  const href = isMovie ? `/movie/${slug}` : `/tv/${slug}`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={href}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        Watch Now
      </Link>
      <Link
        href={href}
        className="flex items-center gap-2 px-8 py-3 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        More Info
      </Link>
    </div>
  );
}
