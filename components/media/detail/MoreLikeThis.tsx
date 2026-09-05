import { DraggableList } from '@/components/media/DraggableList';
import { PosterCard } from '@/components/media/PosterCard';
import type { MediaItem } from '@/types';

export function MoreLikeThis({ items }: { items: MediaItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="w-full px-4 md:px-12 lg:px-24 pb-24">
      <h2 className="text-3xl font-bold text-foreground mb-8">More Like This</h2>
      <DraggableList className="pb-4" innerClassName="space-x-4">
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0 w-[170px] md:w-[210px]">
            <PosterCard item={item} />
          </div>
        ))}
      </DraggableList>
    </div>
  );
}
