import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/config.utils';
import { HeroMeta } from './HeroMeta';
import { HeroActions } from './HeroActions';
import type { HeroSlideProps } from './types';

export function HeroSlide({ item, isActive }: HeroSlideProps) {
  return (
    <div className="relative w-full h-full shrink-0">
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
          <HeroMeta item={item} />
          <p className="text-white/70 text-base md:text-lg max-w-xl line-clamp-3 mb-5 drop-shadow">
            {item.overview}
          </p>
          <HeroActions slug={item.slug} isMovie={!!item.title} />
        </div>
      </div>
    </div>
  );
}
