'use client';

import { useState, useEffect, useRef } from 'react';
import { tmdbImageUrl } from '@/lib/config';

interface HeroTrailerProps {
  backdropPath: string | null;
  title: string;
  trailerUrl?: string | null;
}

interface YTPlayer {
  playVideo(): void;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Extract the YouTube video id from a watch URL. */
function extractTrailerKey(trailerUrl: string | null | undefined): string | null {
  if (!trailerUrl) return null;
  return trailerUrl.match(/[?&]v=([^&]+)/)?.[1] ?? null;
}

export function HeroTrailer({ backdropPath, title, trailerUrl }: HeroTrailerProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);

  const trailerKey = extractTrailerKey(trailerUrl);

  // Load the YouTube Iframe API once
  useEffect(() => {
    if (!trailerKey) return;

    if (window.YT && window.YT.Player) {
      // Already available: defer so we don't setState synchronously in the effect
      queueMicrotask(() => setApiReady(true));
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => setApiReady(true);

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [trailerKey]);

  // Initialize the player after the API is ready
  useEffect(() => {
    if (!apiReady || !trailerKey || !window.YT) return;

    // Start 4-second cooldown before initializing player
    const timer = setTimeout(() => {
      playerRef.current = new window.YT!.Player('youtube-player', {
        videoId: trailerKey,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: 1, // Must be muted to auto-play
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => event.target.playVideo(),
          onStateChange: (event) => {
            // When video is actually playing, fade it in!
            if (event.data === window.YT!.PlayerState.PLAYING) {
              setVideoPlaying(true);
            }
            // When video ends, fade it out
            if (event.data === window.YT!.PlayerState.ENDED) {
              setVideoPlaying(false);
            }
          },
        },
      });
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, trailerKey]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Static Backdrop (Always behind) */}
      <img
        src={tmdbImageUrl(backdropPath, 'w1280') ?? ''}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${videoPlaying ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video Player Container */}
      {trailerKey && (
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-[2000ms] ease-in-out pointer-events-none ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-full h-[140%] -top-[20%] absolute pointer-events-none">
            <div id="youtube-player" className="w-full h-full object-cover pointer-events-none" />
          </div>
        </div>
      )}

      {/* Gradients to blend it into the page and keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
