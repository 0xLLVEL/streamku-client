export interface YTPlayer {
  playVideo(): void;
  destroy(): void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTNamespace {
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
export function extractTrailerKey(trailerUrl: string | null | undefined): string | null {
  if (!trailerUrl) return null;
  return trailerUrl.match(/[?&]v=([^&]+)/)?.[1] ?? null;
}

/** Load the YouTube Iframe API once. Calls `onReady` when `window.YT.Player` exists. Returns a cleanup. */
export function loadYouTubeApi(onReady: () => void): () => void {
  if (typeof window !== 'undefined' && window.YT?.Player) {
    // Already available: defer so callers don't setState synchronously in the effect
    queueMicrotask(onReady);
    return () => {};
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = onReady;

  return () => {
    window.onYouTubeIframeAPIReady = () => {};
  };
}
