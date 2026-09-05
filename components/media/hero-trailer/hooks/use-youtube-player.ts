'use client';

import { useEffect, useRef, useState } from 'react';
import { loadYouTubeApi, type YTPlayer } from '@/lib/youtube.utils';

const PLAYER_INIT_DELAY_MS = 4000;

export function useYouTubePlayer(trailerKey: string | null) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    if (!trailerKey) return;
    return loadYouTubeApi(() => setApiReady(true));
  }, [trailerKey]);

  useEffect(() => {
    if (!apiReady || !trailerKey || !window.YT) return;

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
            if (event.data === window.YT!.PlayerState.PLAYING) {
              setVideoPlaying(true);
            }
            if (event.data === window.YT!.PlayerState.ENDED) {
              setVideoPlaying(false);
            }
          },
        },
      });
    }, PLAYER_INIT_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, trailerKey]);

  return { videoPlaying };
}
