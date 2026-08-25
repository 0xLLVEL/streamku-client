import { fetchApi } from '@/lib/api';

interface UserMediaEntry {
  id: number;
  media_id: number | null;
}

async function findUserMediaEntryId(
  endpoint: '/watchlist' | '/favorites',
  mediaId: number | undefined,
): Promise<number | null> {
  if (mediaId === undefined) {
    return null;
  }

  const res = await fetchApi(endpoint, { cache: 'no-store' });
  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  const entries: UserMediaEntry[] = Array.isArray(json?.data) ? json.data : [];
  return entries.find((entry) => entry.media_id === mediaId)?.id ?? null;
}

/** Returns the watchlist entry id for a media item, or null when absent. */
export function getWatchlistState(mediaId: number | undefined): Promise<number | null> {
  return findUserMediaEntryId('/watchlist', mediaId);
}

/** Returns the favorite entry id for a media item, or null when absent. */
export function getFavoriteState(mediaId: number | undefined): Promise<number | null> {
  return findUserMediaEntryId('/favorites', mediaId);
}
