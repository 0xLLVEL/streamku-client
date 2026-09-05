'use client';

import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/config.utils';
import { extractTrailerKey } from '@/lib/youtube.utils';
import { useYouTubePlayer } from './hero-trailer/hooks/use-youtube-player';

interface HeroTrailerProps {
  backdropPath: string | null;
  title: string;
  trailerUrl?: string | null;
}

export function HeroTrailer({ backdropPath, title, trailerUrl }: HeroTrailerProps) {
  const trailerKey = extractTrailerKey(trailerUrl);
  const { videoPlaying } = useYouTubePlayer(trailerKey);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Static Backdrop (Always behind) */}
      <Image
        src={tmdbImageUrl(backdropPath, 'w1280') ?? ''}
        alt={title}
        fill
        sizes="100vw"
        className={`object-cover transition-opacity duration-[2000ms] ease-in-out ${videoPlaying ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* Video Player Container */}
      {trailerKey && (
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-[2000ms] ease-in-out pointer-events-none ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-full h-[140%] -top-[20%] absolute pointer-events-none">
            <div id="youtube-player" className="w-full h-full object-cover pointer-events-none" />
          </div>
        </div>
      )}
      {/* Gradients to blend it into the page and keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
