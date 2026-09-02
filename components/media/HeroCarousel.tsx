'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MediaItem } from '@/types';
import { tmdbImageUrl } from '@/lib/config';

export function HeroCarousel({ items }: { items: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [items, isPaused]);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative h-[80vh] sm:h-screen w-full flex items-center overflow-hidden bg-[#0a0a0a]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Global edge hider */}
      <div className="absolute inset-x-0 -bottom-4 h-48 bg-gradient-to-t from-[#0a0a0a] from-10% via-[#0a0a0a]/60 to-transparent pointer-events-none z-10" />
      {/* Sliding Track */}
      <div
        className="flex w-full h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={item.id}
              className="relative w-full h-full shrink-0"
            >
              <div className="absolute inset-0">
                <Image
                  src={tmdbImageUrl(item.backdrop_path, 'w1280') ?? ''}
                      alt={item.title || item.name || ''}
                  fill
                  sizes="100vw"
                  className={`object-cover transition-transform duration-[10000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                <div className="absolute inset-x-0 -bottom-2 h-48 bg-gradient-to-t from-[#0a0a0a] from-10% via-[#0a0a0a]/60 to-transparent pointer-events-none" />
              </div>

              <div className="relative w-full h-full flex items-end pb-28 sm:pb-32 px-5 sm:px-8 md:px-16 lg:px-24">
                <div className={`w-full max-w-2xl transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  {/* Logo or Text Title */}
                  {item.images?.logos?.[0]?.file_path ? (
                    <Image
                      src={tmdbImageUrl(item.images.logos[0].file_path, 'w500') ?? ''}
                  alt={item.title || item.name || ''}
                      width={400}
                      height={140}
                      className="w-auto h-auto max-h-20 sm:max-h-24 md:max-h-32 object-contain mb-3 drop-shadow-md origin-left"
                    />
                  ) : (
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                      {item.title || item.name}
                    </h1>
                  )}

                  {/* Meta Info */}
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

                  <p className="text-white/70 text-base md:text-lg max-w-xl line-clamp-3 mb-5 drop-shadow">
                    {item.overview}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      Watch Now
                    </Link>
                    <Link
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="flex items-center gap-2 px-8 py-3 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      More Info
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Indicators (Timeout Progress Bars) */}
      <div className="absolute bottom-20 right-5 sm:bottom-24 sm:right-8 md:right-16 lg:right-24 z-20 flex space-x-3">
        {items.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ${isActive ? 'w-12 bg-white/20' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <div
                  key={currentIndex} // forces the animation to restart on each index change
                  className="absolute inset-0 bg-white origin-left"
                  style={{ animation: 'progress 8s linear forwards' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
