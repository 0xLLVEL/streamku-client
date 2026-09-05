'use client';

import { useEffect } from 'react';
import { syncWatchProgress } from '@/lib/watch-history.utils';
import { ESTIMATED_DURATIONS } from '@/lib/watch-progress.utils';

function findTime(obj: unknown): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  for (const k of ['currentTime', 'current_time', 'time', 'progress', 'position', 'seconds', 'elapsed']) {
    if (typeof o[k] === 'number' && (o[k] as number) > 0) return o[k] as number;
  }
  for (const v of Object.values(o)) { if (v && typeof v === 'object') { const r = findTime(v); if (r !== null) return r; } }
  return null;
}

function findDuration(obj: unknown): number | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const o = obj as Record<string, unknown>;
  for (const k of ['duration', 'durationSeconds', 'duration_seconds', 'totalTime', 'total_time']) {
    if (typeof o[k] === 'number' && (o[k] as number) > 0) return o[k] as number;
  }
  for (const v of Object.values(o)) { if (v && typeof v === 'object') { const r = findDuration(v); if (r !== undefined) return r; } }
  return undefined;
}

interface UseEmbedProgressOpts {
  active: boolean;
  embedUrl: string | null;
  mediaType: 'movie' | 'episode';
  mediaId?: number;
}

/** Syncs embed playback to Continue Watching via postMessage + elapsed fallback. */
export function useEmbedProgress({ active, embedUrl, mediaType, mediaId }: UseEmbedProgressOpts) {
  useEffect(() => {
    if (!active || !embedUrl || !mediaId) return;

    let hasRealProgress = false;
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const time = findTime(data);
        const dur = findDuration(data);
        if (time !== null) {
          hasRealProgress = true;
          await syncWatchProgress({ mediaType, mediaId, progressSeconds: time, durationSeconds: dur });
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    // Fallback only if the embed never sends real time — won't override real progress
    const estimated = mediaType === 'movie' ? ESTIMATED_DURATIONS.movie : ESTIMATED_DURATIONS.episode;
    const start = Date.now();
    const interval = setInterval(() => {
      if (hasRealProgress) return;
      const elapsed = Math.floor((Date.now() - start) / 1000);
      if (elapsed >= 30) syncWatchProgress({ mediaType, mediaId, progressSeconds: elapsed, durationSeconds: estimated });
    }, 5000);

    return () => { window.removeEventListener('message', handleMessage); clearInterval(interval); };
  }, [active, embedUrl, mediaId, mediaType]);
}
