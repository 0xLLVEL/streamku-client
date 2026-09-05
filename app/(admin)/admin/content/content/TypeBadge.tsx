import { cn } from '@/lib/utils';
import type { ContentKind } from './constants';

export function TypeBadge({ kind }: { kind: ContentKind }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-semibold',
        kind === 'movie'
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          : 'bg-red-600/10 border-red-500/20 text-red-400',
      )}
    >
      {kind === 'movie' ? 'Movie' : 'TV Show'}
    </span>
  );
}
