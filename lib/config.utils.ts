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
  if (path.startsWith('http') || path.startsWith('/storage')) {
    return avatarUrl(path);
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Streaming endpoint for an uploaded media file. */
export function buildStreamUrl(mediaId: number | string): string {
  return `${API_BASE_URL}/media/${mediaId}/stream`;
}

export const VIDKING_BASE_URL = 'https://www.vidking.net';

// ponytail: stream domain lives in lib/embed/* — re-exported here so old imports keep working.
export { STREAM_PROVIDERS, isStreamProvider, type StreamProvider } from './embed/providers';
export { buildEmbedUrl, parseProviderId, buildVidKingEmbedUrl } from './embed/urls';

/** Resolve a stored avatar path (/storage/...) to an absolute URL on the API host. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/storage')) {
    const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${origin}${path}`;
  }
  return path;
}

/** Resolve poster/backdrop path: local storage paths are returned as absolute URLs, TMDB paths are converted to image URLs. */
export function artworkUrl(
  path: string | null | undefined,
  size: TmdbImageSize = 'w500',
): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('/storage')) return avatarUrl(path);
  return tmdbImageUrl(path, size);
}

