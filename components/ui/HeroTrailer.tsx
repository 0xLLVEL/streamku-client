'use client';

import { useState, useEffect, useRef } from 'react';

interface HeroTrailerProps {
  backdropPath: string | null;
  title: string;
  trailerUrl?: string | null;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function HeroTrailer({ backdropPath, title, trailerUrl }: HeroTrailerProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<any>(null);
  const tmdbBaseUrl = 'https://image.tmdb.org/t/p/original';
  
  // Extract YouTube ID from URL
  let trailerKey = null;
  if (trailerUrl) {
    const match = trailerUrl.match(/[?&]v=([^&]+)/);
    if (match) trailerKey = match[1];
  }

  // Load YouTube Iframe API
  useEffect(() => {
    if (!trailerKey) return;

    // If already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
    
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [trailerKey]);

  // Initialize Player
  useEffect(() => {
    if (!apiReady || !trailerKey) return;

    let timer: NodeJS.Timeout;

    // Start 4-second cooldown before initializing player
    timer = setTimeout(() => {
      playerRef.current = new window.YT.Player('youtube-player', {
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
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // When video is actually playing, fade it in!
            if (event.data === window.YT.PlayerState.PLAYING) {
              setVideoPlaying(true);
            }
            // When video ends, fade it out
            if (event.data === window.YT.PlayerState.ENDED) {
              setVideoPlaying(false);
            }
          }
        }
      });
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, trailerKey]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Static Backdrop (Always behind) */}
      <img 
        src={`${tmdbBaseUrl}${backdropPath}`} 
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
