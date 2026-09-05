import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroTrailer } from '@/components/media/HeroTrailer';
import type { Genre } from '@/types';

interface DetailHeroProps {
  title: string;
  backdropPath: string | null;
  trailerUrl?: string | null;
  posterSrc: string;
  posterAlt: string;
  genres?: Genre[];
  actions: ReactNode;
  meta: ReactNode;
  tagline?: string | null;
  overview?: string | null;
}

export function DetailHero({ title, backdropPath, trailerUrl, posterSrc, posterAlt, genres, actions, meta, tagline, overview }: DetailHeroProps) {
  return (
    <div className="relative h-[95vh] w-full flex items-center justify-center">
      <HeroTrailer backdropPath={backdropPath} title={title} trailerUrl={trailerUrl} />
      <div className="relative z-30 w-full h-full flex flex-col justify-end px-4 md:px-12 lg:px-24 pb-10 md:pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-6 md:gap-0">
          <div className="flex-1 w-full max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400 mb-2 tracking-tighter drop-shadow-2xl leading-tight">
              {title}
            </h1>
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-300 mb-6 drop-shadow-md">
                {genres?.map((genre, idx, arr) => (
                  <span key={genre.id} className="flex items-center">
                    <Link href={`/genres/${genre.slug}`} className="hover:text-white transition-colors cursor-pointer">
                      {genre.name}
                    </Link>
                    {idx < arr.length - 1 && <span className="mx-2 text-gray-500">•</span>}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {actions}
            </div>
            {meta}
            {tagline && <p className="text-gray-400 italic mb-3 font-medium text-base">{tagline}</p>}
            <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-2xl drop-shadow-sm font-medium line-clamp-4">
              {overview}
            </p>
          </div>
          <div className="w-64 shrink-0 hidden lg:block liquid-glass p-2 rounded-[2rem] rotate-[2deg] hover:rotate-0 transition-transform duration-500 shadow-2xl ml-8">
            <Image
              src={posterSrc}
              alt={posterAlt}
              width={342}
              height={513}
              sizes="256px"
              className="w-full h-auto rounded-3xl shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
