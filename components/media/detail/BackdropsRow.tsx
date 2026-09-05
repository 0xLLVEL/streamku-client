import { DraggableList } from '@/components/media/DraggableList';
import { artworkUrl, tmdbImageUrl } from '@/lib/config.utils';

interface BackdropsRowProps {
  backdropPath?: string | null;
  backdrops?: { file_path: string }[];
}

export function BackdropsRow({ backdropPath, backdrops }: BackdropsRowProps) {
  // ponytail: show all from admin — main backdrop first, de-duplicated.
  const uniq = Array.from(new Set([
    ...(backdropPath ? [backdropPath] : []),
    ...((backdrops ?? []).map((b) => b.file_path)),
  ]));
  if (uniq.length === 0) return null;
  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-8">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white">Backdrops</h2>
        <span className="text-sm text-white/50">({uniq.length})</span>
      </div>
      <DraggableList className="pb-2" innerClassName="space-x-4">
        {uniq.map((path, idx) => (
          <div key={`${path}-${idx}`} className="snap-start shrink-0 w-[280px] md:w-[360px] aspect-video rounded-xl overflow-hidden bg-muted border border-white/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artworkUrl(path, 'w780') ?? tmdbImageUrl(path, 'w780') ?? ''} alt={`Backdrop ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </DraggableList>
    </div>
  );
}
