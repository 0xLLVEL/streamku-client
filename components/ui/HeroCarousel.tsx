'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function HeroCarousel({ items }: { items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000); // 8 seconds per slide
    
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const tmdbBaseUrl = 'https://image.tmdb.org/t/p/original';

  return (
    <div className="relative h-screen w-full flex items-center overflow-hidden bg-[#0a0a0a]">
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
                <img 
                  src={`${tmdbBaseUrl}${item.backdrop_path}`} 
                  alt={item.title || item.name} 
                  className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                <div className="absolute inset-x-0 -bottom-2 h-64 bg-gradient-to-t from-[#0a0a0a] from-20% via-[#0a0a0a]/80 to-transparent pointer-events-none" />
              </div>
              
              <div className="relative w-full h-full flex items-end pb-40 px-8 md:px-16 lg:px-24">
                <div className={`w-full max-w-2xl transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-[#fbbf24] text-black text-[10px] md:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
                      Trending This Week
                    </span>
                    <span className="bg-[#e50914] text-white text-[10px] md:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
                      {item.title ? 'Movie' : 'TV Series'}
                    </span>
                  </div>

                  {/* Logo or Text Title */}
                  {item.images?.logos?.[0]?.file_path ? (
                    <img 
                      src={`${tmdbBaseUrl}${item.images.logos[0].file_path}`} 
                      alt={item.title || item.name}
                      className="max-h-24 md:max-h-32 object-contain mb-4 drop-shadow-md origin-left"
                    />
                  ) : (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                      {item.title || item.name}
                    </h1>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-sm md:text-base font-semibold text-white/80 mb-6 drop-shadow">
                    {item.vote_average > 0 && (
                      <span className="flex items-center text-yellow-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {Number(item.vote_average).toFixed(1)}
                      </span>
                    )}
                    {item.release_date || item.first_air_date ? (
                      <>
                        <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
                        <span className="text-white/40">•</span>
                      </>
                    ) : null}
                    {item.runtime > 0 ? (
                      <>
                        <span>{Math.floor(item.runtime / 60)}h {item.runtime % 60}m</span>
                        <span className="text-white/40">•</span>
                      </>
                    ) : item.episode_run_time?.[0] ? (
                      <>
                        <span>{item.episode_run_time[0]}m</span>
                        <span className="text-white/40">•</span>
                      </>
                    ) : null}
                    <span className="text-white/60">Action, Adventure</span>
                  </div>

                  <p className="text-white/70 text-sm md:text-base max-w-xl line-clamp-3 mb-8 drop-shadow">
                    {item.overview}
                  </p>
                  <div className="flex space-x-3">
                    <Link 
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="px-6 py-2.5 bg-[#e50914] text-white text-sm font-bold rounded-md hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Watch Now
                    </Link>
                    <Link 
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="px-6 py-2.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-md hover:bg-white/30 transition-colors border border-white/10"
                    >
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
      <div className="absolute bottom-24 right-8 md:right-16 lg:right-24 z-20 flex space-x-3">
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
