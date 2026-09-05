// ponytail: single source for watch-progress math — was duplicated in
// ContinueWatchingRow, LibraryTabs, PlayAction, SeasonEpisodeViewer.

/** Fallback durations (seconds) when the API reports none. */
export const ESTIMATED_DURATIONS = { movie: 7200, episode: 1440 } as const;

/** Progress bar percent, clamped 0–100 with a visible minimum while playing. */
export function calcProgressPercent(progressSeconds: number, durationSeconds: number): number {
  if (progressSeconds <= 0) return 0;
  const estimated = durationSeconds > 0 ? durationSeconds : ESTIMATED_DURATIONS.movie;
  const raw = durationSeconds > 0
    ? (progressSeconds / durationSeconds) * 100
    : (progressSeconds / estimated) * 100;
  return Math.min(100, Math.max(0, Math.max(8, raw)));
}

/** Human "Xh Ym left" label for remaining playback. */
export function formatRemaining(progressSeconds: number, durationSeconds: number): string {
  const left = Math.max(0, durationSeconds - progressSeconds);
  if (left <= 0) return 'Finished';
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
