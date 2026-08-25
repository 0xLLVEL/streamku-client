/**
 * Central place for external URL construction.
 * Every hardcoded base URL in the app should come from here.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

type TmdbImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original';

/** Build a TMDB image URL. Returns `null` when no path is provided. */
export function tmdbImageUrl(
  path: string | null | undefined,
  size: TmdbImageSize,
): string | null {
  if (!path) {
    return null;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Streaming endpoint for an uploaded media file. */
export function buildStreamUrl(mediaId: number | string): string {
  return `${API_BASE_URL}/media/${mediaId}/stream`;
}
