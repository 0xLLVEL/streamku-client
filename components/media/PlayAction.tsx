'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { API_BASE_URL, buildStreamUrl } from '@/lib/config';
import { resolveStreamableVideo } from '@/lib/media';
import { useIsClient } from '@/hooks/useIsClient';

interface ExternalEmbedVideo {
  site: string;
  key: string;
}

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
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen || !embedUrl || !watchableId) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // Vidking sends { event: 'timeupdate', currentTime: number, duration: number } or similar
        // Adjust this if Vidking uses different property names
        const time = data.time || data.currentTime || data.progress;
        const dur = data.duration || data.totalTime;
        
        if (typeof time === 'number' && time > 0) {
          const { apiFetch } = await import('@/lib/apiClient');
          await apiFetch('history/sync', {
            method: 'PATCH',
            body: JSON.stringify({
              watchable_type: type === 'movie' ? 'movie' : 'episode',
              watchable_id: watchableId,
              progress_seconds: Math.floor(time),
              completed: dur && time >= dur - 60 ? true : false,
            }),
            headers: { 'Content-Type': 'application/json' },
            requireAuth: true,
          }).catch(e => {
            if (e.message.includes('not found')) {
              apiFetch('history', {
                method: 'POST',
                body: JSON.stringify({
                  watchable_type: type === 'movie' ? 'movie' : 'episode',
                  watchable_id: watchableId,
                  progress_seconds: Math.floor(time),
                  duration_seconds: Math.floor(dur || 0),
                  completed: dur && time >= dur - 60 ? true : false,
                }),
                headers: { 'Content-Type': 'application/json' },
                requireAuth: true,
              }).catch(console.error);
            }
          });
        }
      } catch {
        // Ignore JSON parse errors for non-vidking messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, embedUrl, watchableId, type]);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (streamUrl || embedUrl) {
      setIsOpen(true);
      return;
    }

    // Check external videos first
    if (videos && videos.length > 0) {
      const extVideo = videos[0]; // pick first external stream
      if (extVideo.site === 'VidKing') {
        // Construct VidKing URL
        let vUrl = '';
        if (type === 'movie') {
          vUrl = `https://www.vidking.net/embed/movie/${extVideo.key}`;
        } else if (type === 'tv') {
          // If the key already has slashes (e.g. 12345/1/1), use it directly, else append season/episode
          if (extVideo.key.includes('/')) {
            vUrl = `https://www.vidking.net/embed/tv/${extVideo.key}`;
          } else {
            vUrl = `https://www.vidking.net/embed/tv/${extVideo.key}/${seasonNumber || 1}/${episodeNumber || 1}`;
          }
        }
        setEmbedUrl(vUrl);
        setIsOpen(true);
        return;
      } else if (extVideo.site === 'Embed') {
        setEmbedUrl(extVideo.key); // assume custom embed URL
        setIsOpen(true);
        return;
      } else {
        // other sites can be added here
        setEmbedUrl(extVideo.key);
        setIsOpen(true);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${mediaEndpoint}`);

      if (!res.ok) throw new Error('Failed to load media');

      const json = await res.json();
      const videoData = resolveStreamableVideo(
        json.data,
        type === 'movie' ? 'Movie' : 'Episode',
      );

      if (videoData) {
        setStreamUrl(buildStreamUrl(videoData.id));
        setIsOpen(true);
      } else {
        alert('Video not available yet. Please upload it first.');
      }
    } catch {
      alert('Failed to load video.');
    } finally {
      setLoading(false);
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
