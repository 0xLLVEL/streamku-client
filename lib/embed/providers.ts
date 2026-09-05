// ponytail: provider registry moved out of lib/config.ts — stream domain lives here.

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
