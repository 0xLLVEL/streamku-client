import type { CarouselIndicatorsProps } from './types';

export function CarouselIndicators({ count, currentIndex, autoplayMs, onSelect }: CarouselIndicatorsProps) {
  return (
    <div className="absolute bottom-20 right-5 sm:bottom-24 sm:right-8 md:right-16 lg:right-24 z-20 flex space-x-3">
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === currentIndex;
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ${isActive ? 'w-12 bg-white/20' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {isActive && (
              <div
                key={currentIndex}
                className="absolute inset-0 bg-white origin-left"
                style={{ animation: `progress ${autoplayMs}ms linear forwards` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
