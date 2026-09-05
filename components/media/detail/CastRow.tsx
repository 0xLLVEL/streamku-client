import Image from 'next/image';
import { DraggableList } from '@/components/media/DraggableList';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { Cast } from '@/types';

export function CastRow({ cast }: { cast: Cast[] }) {
  if (!cast || cast.length === 0) return null;
  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-12">
      <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">Top Cast</h2>
      <DraggableList className="pb-4" innerClassName="space-x-6">
        {cast.slice(0, 15).map((actor, index) => (
          <div key={actor.id ?? index} className="snap-start flex-shrink-0 w-28 md:w-36 group">
            <div className="aspect-square rounded-full overflow-hidden liquid-glass mb-3 mx-auto w-24 md:w-32 border-2 border-white/10 shadow-lg relative">
              {actor.profile_path ? (
                <Image
                  src={tmdbImageUrl(actor.profile_path, 'w185') ?? ''}
                  alt={actor.name}
                  fill
                  sizes="(max-width: 768px) 96px, 128px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/30 text-xs text-center p-2 pointer-events-none">No Image</div>
              )}
            </div>
            <h3 className="text-white font-bold text-sm truncate drop-shadow-sm text-center px-1 pointer-events-none">{actor.name}</h3>
            <p className="text-white/50 text-xs truncate text-center px-1 pointer-events-none">{actor.character}</p>
          </div>
        ))}
      </DraggableList>
    </div>
  );
}
