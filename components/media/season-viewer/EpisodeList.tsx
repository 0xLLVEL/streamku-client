import type { Episode } from '@/types';
import { EpisodeCard } from './EpisodeCard';

export function EpisodeList({ episodes, showSlug }: { episodes: Episode[]; showSlug: string }) {
  if (!episodes || episodes.length === 0) {
    return <div className="text-white/50 text-sm">No episodes found.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {episodes.map((episode: Episode) => (
        <EpisodeCard key={episode.id} episode={episode} showSlug={showSlug} />
      ))}
    </div>
  );
}
