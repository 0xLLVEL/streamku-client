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
    <div className="relative h-[70vh] w-full flex items-center overflow-hidden bg-[#0a0a0a]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>
              
              <div className="relative w-full h-full flex items-center px-8 md:px-16 lg:px-24">
                <div className={`w-full max-w-3xl transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-sm">
                    {item.title || item.name}
                  </h1>
                  <p className="text-gray-300 text-lg max-w-2xl line-clamp-3 mb-8">
                    {item.overview}
                  </p>
                  <div className="flex space-x-4">
                    <Link 
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
                    >
                      Play Now
                    </Link>
                    <Link 
                      href={item.title ? `/movie/${item.slug}` : `/tv/${item.slug}`}
                      className="px-8 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/10"
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
