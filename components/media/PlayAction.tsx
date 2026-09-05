'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { API_BASE_URL, buildEmbedUrl } from '@/lib/config.utils';
import { usePlayableMedia, type ExternalEmbedVideo } from '@/lib/playback/use-playable-media';
import { useEmbedProgress } from '@/lib/playback/use-embed-progress';
import { useIsClient } from '@/hooks/use-is-client';

interface PlayActionProps {
  mediaEndpoint: string;
  title: string;
  poster: string;
  videos?: ExternalEmbedVideo[];
  type?: 'movie' | 'tv';
  /** TMDB id of the parent title (reserved for episode embed keys). */
  tmdbId?: string | number;
  seasonNumber?: number;
  episodeNumber?: number;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  watchableId?: number;
  initialTime?: number;
}

export function PlayAction({
  mediaEndpoint,
  title,
  poster,
  videos = [],
  type = 'movie',
  seasonNumber,
  episodeNumber,
  label = "Play",
  className,
  icon,
  watchableId,
  initialTime = 0,
}: PlayActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const playable = usePlayableMedia({ type, seasonNumber, episodeNumber });
  const { streamUrl, embedUrl, subtitleTracks, loading } = playable;
  const isClient = useIsClient();

  useEmbedProgress({
    active: isOpen,
    embedUrl,
    mediaType: type === 'movie' ? 'movie' : 'episode',
    mediaId: watchableId,
  });

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (streamUrl || embedUrl) {
      setIsOpen(true);
      return;
    }

    // Check external videos first
    if (videos && videos.length > 0) {
      playable.openExternal(videos);
      setIsOpen(true);
      return;
    }

    const outcome = await playable.loadFromEndpoint(mediaEndpoint, type === 'movie' ? 'Movie' : 'Episode');
    if (outcome === 'stream') {
      setIsOpen(true);
      return;
    }
    if (outcome === 'error') {
      alert('Failed to load video.');
      return;
    }

    // No uploaded file — try embed from title/episode endpoint
    try {
      const titleEndpoint = mediaEndpoint.replace(/\/media$/, '');
      const titleRes = await fetch(`${API_BASE_URL}${titleEndpoint}`);
      if (titleRes.ok) {
        const titleJson = await titleRes.json();
        const vids: ExternalEmbedVideo[] = titleJson.data?.videos ?? titleJson.videos ?? [];
        const embed = vids[0];
        if (embed) {
          playable.setEmbedUrl(buildEmbedUrl(embed.site, embed.key, type, seasonNumber, episodeNumber) ?? embed.key);
          setIsOpen(true);
        } else {
          alert('Video not available yet. Please upload it first.');
        }
      } else {
        alert('Video not available yet. Please upload it first.');
      }
    } catch {
      alert('Failed to load video.');
    }
  };

  return (
    <>
      <button onClick={handlePlayClick} className={className} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {icon || <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
            {label}
          </span>
        )}
      </button>

      {isClient && isOpen && (streamUrl || embedUrl) && createPortal(
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
          {streamUrl ? (
            <VideoPlayer
              src={streamUrl}
              title={title}
              poster={poster}
              onBack={() => setIsOpen(false)}
              watchableId={watchableId}
              watchableType={type === 'movie' ? 'movie' : 'episode'}
              initialTime={initialTime}
              subtitles={subtitleTracks}
            />
          ) : embedUrl ? (
            <div className="w-full h-full relative flex flex-col bg-black">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 left-6 z-50 p-3 bg-black/50 hover:bg-red-600 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <iframe
                src={embedUrl}
                className="w-full h-full border-none outline-none bg-black"
                allowFullScreen
              ></iframe>
            </div>
          ) : null}
        </div>,
        document.body
      )}
    </>
  );
}
