import { apiFetch } from '@/lib/apiClient';

export interface WatchProgressInput {
  watchableType: 'movie' | 'episode';
  watchableId: number;
  progressSeconds: number;
  durationSeconds?: number;
}

/** True when a play session counts as finished (within 60s of the end, or past 90%). */
export function isNearEnd(progressSeconds: number, durationSeconds: number): boolean {
  return durationSeconds > 0 && progressSeconds >= Math.max(durationSeconds - 60, durationSeconds * 0.9);
}

/**
 * Record a watch-progress heartbeat. Best-effort: a PATCH to history/sync,
 * falling back to a POST history when no record exists yet.
 */
export async function syncWatchProgress(input: WatchProgressInput): Promise<void> {
  const { watchableType, watchableId, progressSeconds, durationSeconds = 0 } = input;
  const payload = {
    watchable_type: watchableType,
    watchable_id: watchableId,
    progress_seconds: Math.floor(progressSeconds),
    completed: isNearEnd(progressSeconds, durationSeconds),
  };

  try {
    await apiFetch('history/sync', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      requireAuth: true,
    });
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes('not found')) return;
    try {
      await apiFetch('history', {
        method: 'POST',
        body: JSON.stringify({ ...payload, duration_seconds: Math.floor(durationSeconds) }),
        headers: { 'Content-Type': 'application/json' },
        requireAuth: true,
      });
    } catch (err) {
      console.error(err);
    }
  }
}