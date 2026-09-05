'use client';

import { useAutoplay } from './hooks/use-autoplay';
import { HeroSlide } from './HeroSlide';
import { CarouselIndicators } from './CarouselIndicators';
import { AUTOPLAY_MS } from './constants';
import type { HeroCarouselProps } from './types';

export function HeroCarousel({ items }: HeroCarouselProps) {
  const { currentIndex, setCurrentIndex, setIsPaused } = useAutoplay(items?.length ?? 0);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative h-[80vh] sm:h-screen w-full flex items-center overflow-hidden bg-[#0a0a0a]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-x-0 -bottom-4 h-48 bg-gradient-to-t from-[#0a0a0a] from-10% via-[#0a0a0a]/60 to-transparent pointer-events-none z-10" />
      <div
        className="flex w-full h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <HeroSlide key={item.id} item={item} isActive={index === currentIndex} />
        ))}
      </div>
      <CarouselIndicators count={items.length} currentIndex={currentIndex} autoplayMs={AUTOPLAY_MS} onSelect={setCurrentIndex} />
    </div>
  );
}

export { HeroSlide } from './HeroSlide';
export { HeroMeta } from './HeroMeta';
export { HeroActions } from './HeroActions';
export { CarouselIndicators } from './CarouselIndicators';
export { AUTOPLAY_MS } from './constants';
export type { HeroCarouselProps } from './types';
