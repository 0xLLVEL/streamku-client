import { STREAM_PROVIDERS } from './providers';

// ponytail: embed URL build/parse moved out of lib/config.ts — stream domain lives here.

export const VIDKING_BASE_URL = 'https://www.vidking.net';

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
