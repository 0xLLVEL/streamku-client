/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { API_BASE_URL, buildEmbedUrl, buildStreamUrl } from '@/lib/config.utils';
import { resolveStreamableVideo } from '@/lib/media.utils';

export interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
}

export interface ExternalEmbedVideo {
  site: string;
  key: string;
}

/** Subtitle tracks from grouped media (subtitles/subtitle/captions collections). */
export function parseSubtitleTracks(data: any): SubtitleTrack[] {
  const rawSubs: any[] = data?.subtitles ?? data?.subtitle ?? data?.captions ?? [];
  if (!Array.isArray(rawSubs)) return [];
  return rawSubs
    .map((m: any) => ({
      url: m.url ?? m.path,
      lang: m.metadata?.language ?? m.language ?? 'en',
      label: (m.metadata?.language ?? m.language ?? 'en').toUpperCase(),
    }))
    .filter((t) => t.url);
}

interface UsePlayableMediaOpts {
  type: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
}

/** Shared playable-media state: uploaded stream vs external embed + subtitles. */
export function usePlayableMedia({ type, seasonNumber, episodeNumber }: UsePlayableMediaOpts) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const openExternal = (videos: ExternalEmbedVideo[] | undefined) => {
    if (!videos || videos.length === 0) return false;
    const ext = videos[0];
    setEmbedUrl(buildEmbedUrl(ext.site, ext.key, type, seasonNumber, episodeNumber) ?? ext.key);
    return true;
  };

  const loadFromEndpoint = async (endpoint: string, contentLabel: 'Movie' | 'Episode') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error('Failed to load media');
      const json = await res.json();
      setSubtitleTracks(parseSubtitleTracks(json.data));
      const videoData = resolveStreamableVideo(json.data, contentLabel);
      if (videoData) {
        setStreamUrl(buildStreamUrl(videoData.id));
        return 'stream' as const;
      }
      return 'missing' as const;
    } catch {
      return 'error' as const;
    } finally {
      setLoading(false);
    }
  };

  return { streamUrl, embedUrl, subtitleTracks, loading, openExternal, loadFromEndpoint, setStreamUrl, setEmbedUrl };
}
