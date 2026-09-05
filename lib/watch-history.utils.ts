import { apiFetch } from '@/lib/api-client.utils';

export interface WatchProgressInput {
  mediaType: 'movie' | 'episode';
  mediaId: number;
  progressSeconds: number;
  durationSeconds?: number;
}

/** True when a play session counts as finished (within 60s of the end, or past 90%). */
export function isNearEnd(progressSeconds: number, durationSeconds: number): boolean {
  return durationSeconds > 0 && progressSeconds >= Math.max(durationSeconds - 60, durationSeconds * 0.9);
}

/**
 * Record a watch-progress heartbeat. Single idempotent upsert: POST /history
 * creates or updates the row for this media item.
 */
export async function syncWatchProgress(input: WatchProgressInput): Promise<void> {
  const { mediaType, mediaId, progressSeconds, durationSeconds = 0 } = input;
  const payload = {
    media_type: mediaType,
    media_id: mediaId,
    progress_seconds: Math.floor(progressSeconds),
    duration_seconds: Math.floor(durationSeconds),
    completed: isNearEnd(progressSeconds, durationSeconds),
  };

  try {
    await apiFetch('history', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      requireAuth: true,
    });
  } catch (err) {
    console.error(err);
  }
}