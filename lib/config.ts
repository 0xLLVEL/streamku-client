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

const std = (label: string, base: string) => ({ label, base, movie: (k: string) => `/embed/movie/${k}`, tv: (k: string, s: number | string, e: number | string) => `/embed/tv/${k}/${s}/${e}` });
export const STREAM_PROVIDERS = {
  VidKing: std('VidKing', 'https://www.vidking.net'),
  VixSrc: std('VixSrc', 'https://vixsrc.to'),
  VidSrcCc: std('VidSrc.cc', 'https://vidsrc.cc'),
  VidSrcMe: std('VidSrc.me', 'https://vidsrc.me'),
  EmbedSu: std('EmbedSu', 'https://embed.su'),
  AutoEmbed: std('AutoEmbed', 'https://autoembed.cc'),
  SuperEmbed: { label: 'SuperEmbed', base: 'https://multiembed.mov', movie: (k: string) => `/?video_id=${k}`, tv: (k: string, s: number | string, e: number | string) => `/?video_id=${k}&s=${s}&e=${e}` },
  '2Embed': { label: '2Embed', base: 'https://www.2embed.cc', movie: (k: string) => `/embed/${k}`, tv: (k: string, s: number | string, e: number | string) => `/embedtv/${k}&s=${s}&e=${e}` },
  VidLink: { label: 'VidLink', base: 'https://vidlink.pro', movie: (k: string) => `/movie/${k}`, tv: (k: string, s: number | string, e: number | string) => `/tv/${k}/${s}/${e}` },
} as const;

export type StreamProvider = keyof typeof STREAM_PROVIDERS;

export function isStreamProvider(site: string): site is StreamProvider {
  return site in STREAM_PROVIDERS;
}

/** Build an embed URL for any provider. Returns null for unknown sites unless key is already a URL. */
export function buildEmbedUrl(
  site: string,
  key: string,
  type: 'movie' | 'tv',
  season?: number | string,
  episode?: number | string,
): string | null {
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  const provider = (STREAM_PROVIDERS as Record<string, { base: string; movie: (k: string) => string; tv: (k: string, s: number | string, e: number | string) => string }>)[site];
  if (!provider) return null;
  if (type === 'movie') return `${provider.base}${provider.movie(key)}`;
  // ponytail: legacy VidKing keys already carry season/episode as "id/s/e"
  if (key.includes('/')) {
    const parts = key.split('/');
    // if key is like "123/2/5", use parts; otherwise treat as-is for VidKing compat
    if (parts.length >= 3 && /^\d+$/.test(parts[0])) {
      return `${provider.base}${provider.tv(parts[0], parts[1] ?? season ?? 1, parts[2] ?? episode ?? 1)}`;
    }
    return `${provider.base}/embed/tv/${key}`;
  }
  return `${provider.base}${provider.tv(key, season ?? 1, episode ?? 1)}`;
}

/** Extract provider key from full URL or bare ID. */
export function parseProviderId(site: string, input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (site === 'VidLink') {
    const m = trimmed.match(/vidlink\.pro\/(?:movie|tv)\/([0-9]+(?:\/[0-9]+\/[0-9]+)?)/);
    if (m) return m[1];
    if (/^\d+(?:\/\d+\/\d+)?$/.test(trimmed)) return trimmed;
    return null;
  }
  // generic: match host-specific embed path or bare id
  const hostMap: Record<string, string> = {
    VidKing: 'vidking\\.net',
    VixSrc: 'vixsrc\\.to',
    VidSrcCc: 'vidsrc\\.cc',
    VidSrcMe: 'vidsrc\\.me',
    SuperEmbed: 'multiembed\\.mov',
    '2Embed': '2embed\\.cc',
    EmbedSu: 'embed\\.su',
    AutoEmbed: 'autoembed\\.cc',
  };
  const host = hostMap[site];
  if (host) {
    // try provider-specific path extraction first
    const urlMatch = trimmed.match(new RegExp(`${host}/(?:embed|v)?/?(?:movie\\/|tv\\/)?([a-zA-Z0-9_\\/\\-]+)`));
    if (urlMatch) return urlMatch[1].replace(/\/$/, '');
  } else {
    const urlMatch = trimmed.match(/vidking\.net\/(?:embed|v)\/(?:movie\/|tv\/)?([a-zA-Z0-9_\/-]+)/);
    if (urlMatch) return urlMatch[1];
  }
  // bare ID (digits, plus slash for legacy tv keys)
  if (/^[a-zA-Z0-9_\/-]+$/.test(trimmed)) return trimmed;
  return null;
}

/** Build a VidKing embed URL. TV keys that already carry season/episode are used as-is. */
export function buildVidKingEmbedUrl(
  key: string,
  type: 'movie' | 'tv',
  season?: number | string,
  episode?: number | string,
): string {
  return buildEmbedUrl('VidKing', key, type, season, episode) ?? `${VIDKING_BASE_URL}/embed/movie/${key}`;
}
