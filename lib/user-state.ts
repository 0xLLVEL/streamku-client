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

export const getWatchlistState = (mediaId: number | undefined): Promise<number | null> => findUserMediaEntryId('/watchlist', mediaId);
export const getFavoriteState = (mediaId: number | undefined): Promise<number | null> => findUserMediaEntryId('/favorites', mediaId);
