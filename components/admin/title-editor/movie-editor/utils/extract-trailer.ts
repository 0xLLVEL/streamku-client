export interface TmdbVideoResultItem {
  type?: string;
  site?: string;
  key?: string;
}

export function extractTrailerUrl(videos?: TmdbVideoResultItem[] | null): string | null {
  const trailerKey = videos?.find((video) => video.type === 'Trailer' && video.site === 'YouTube')?.key;
  return trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;
}
