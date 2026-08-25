'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

type ToggleEndpoint = '/favorites' | '/watchlist';
type ResourceKey = 'favoritable' | 'watchlistable';

interface UseResourceToggleOptions {
  endpoint: ToggleEndpoint;
  resourceKey: ResourceKey;
  resourceId: number;
  resourceType: 'movie' | 'tv_show';
  /** Server entry id when the item is already saved, otherwise null/undefined. */
  initialEntryId?: number | null;
}

interface UseResourceToggleResult {
  isAdded: boolean;
  isLoading: boolean;
  /** True briefly after a successful add/remove (used to flash feedback). */
  isSuccess: boolean;
  toggle: () => Promise<void>;
}

/**
 * Optimistic-style toggle hook shared by FavoriteButton and WatchlistButton.
 */
export function useResourceToggle({
  endpoint,
  resourceKey,
  resourceId,
  resourceType,
  initialEntryId = null,
}: UseResourceToggleOptions): UseResourceToggleResult {
  const [entryId, setEntryId] = useState<number | null>(initialEntryId);
  const [isAdded, setIsAdded] = useState(initialEntryId != null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const flashSuccess = useCallback(() => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  }, []);

  const removeEntry = useCallback(async () => {
    const res = await apiFetch(`${endpoint}/${entryId}`, { method: 'DELETE' });
    if (res.ok) {
      setIsAdded(false);
      setEntryId(null);
      flashSuccess();
    } else {
      alert(`Failed to remove from ${endpoint.slice(1)}. You might need to login first.`);
    }
  }, [endpoint, entryId, flashSuccess]);

  const addEntry = useCallback(async () => {
    const res = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        [`${resourceKey}_id`]: resourceId,
        [`${resourceKey}_type`]: resourceType,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      alert(`Failed to add to ${endpoint.slice(1)}. You might need to login first.`);
      return;
    }

    const data = await res.json();
    setIsAdded(true);
    if (data?.data?.id) {
      setEntryId(data.data.id);
    }
    flashSuccess();
  }, [endpoint, flashSuccess, resourceKey, resourceId, resourceType]);

  const toggle = useCallback(async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    try {
      if (isAdded && entryId) {
        await removeEntry();
      } else {
        await addEntry();
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        alert('Please login to use this feature.');
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [addEntry, entryId, isAdded, isLoading, removeEntry]);

  return { isAdded, isLoading, isSuccess, toggle };
}
