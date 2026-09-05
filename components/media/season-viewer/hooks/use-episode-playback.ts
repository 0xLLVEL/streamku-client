'use client';

import { useState } from 'react';
import { usePlayableMedia } from '@/lib/playback/use-playable-media';
import { useEmbedProgress } from '@/lib/playback/use-embed-progress';
import type { Episode } from '@/types';

export function useEpisodePlayback(episode: Episode, showSlug: string) {
  const [isOpen, setIsOpen] = useState(false);
  const media = usePlayableMedia({ type: 'tv', seasonNumber: episode.season_number, episodeNumber: episode.episode_number });
  const { streamUrl, embedUrl } = media;

  useEmbedProgress({ active: isOpen, embedUrl, mediaType: 'episode', mediaId: episode.id });

  const handlePlayClick = async () => {
    if (streamUrl || embedUrl) {
      setIsOpen(true);
      return;
    }

    if (episode.videos && episode.videos.length > 0) {
      media.openExternal(episode.videos);
      setIsOpen(true);
      return;
    }

    if (!showSlug) return;

    const outcome = await media.loadFromEndpoint(
      `/tv-shows/${showSlug}/seasons/${episode.season_number}/episodes/${episode.episode_number}/media`,
      'Episode',
    );
    if (outcome === 'stream') setIsOpen(true);
    else if (outcome === 'missing') alert('Video not available yet. Please upload it first.');
    else alert('Failed to load video.');
  };

  return { isOpen, setIsOpen, handlePlayClick, ...media };
}
