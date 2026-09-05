'use client';

import type { ReactNode } from 'react';
import { useResourceToggle } from '@/hooks/use-resource-toggle';
import { StatefulToggleButton } from '@/components/media/StatefulToggleButton';
import { SpinnerIcon, CheckIcon } from '@/components/ui/icons';

// ponytail: FavoriteButton + WatchlistButton were ~80% identical — one core + config.

interface ToggleConfig {
  endpoint: '/favorites' | '/watchlist';
  activeClass: string;
  activeIcon: ReactNode;
  activeLabel: string;
  idleIcon: ReactNode;
  idleLabel: string;
}

function ResourceToggleButton({
  resourceId,
  resourceType,
  entryId,
  config,
}: {
  resourceId: number;
  resourceType: 'movie' | 'tv_show';
  entryId: number | null;
  config: ToggleConfig;
}) {
  const { isAdded, isLoading, isSuccess, toggle } = useResourceToggle({
    endpoint: config.endpoint,
    resourceId,
    resourceType,
    initialEntryId: entryId,
  });

  const appearance = isLoading
    ? { className: 'liquid-glass hover:bg-white/20 text-white', icon: <SpinnerIcon />, label: 'Loading' }
    : isSuccess
      ? isAdded
        ? { className: 'bg-green-600 hover:bg-green-700 text-white', icon: <CheckIcon />, label: 'Added' }
        : { className: 'bg-red-600 hover:bg-red-700 text-white', icon: <CheckIcon />, label: 'Removed' }
      : isAdded
        ? { className: `liquid-glass hover:bg-white/20 ${config.activeClass}`, icon: config.activeIcon, label: config.activeLabel }
        : { className: 'liquid-glass hover:bg-white/20 text-white', icon: config.idleIcon, label: config.idleLabel };

  return (
    <StatefulToggleButton
      onClick={() => void toggle()}
      disabled={isLoading || isSuccess}
      className={appearance.className}
      icon={appearance.icon}
      label={appearance.label}
    />
  );
}

const HEART_ACTIVE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
);
const HEART_IDLE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);
const BOOKMARK_ACTIVE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
);
const BOOKMARK_IDLE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
);

export function FavoriteButton({
  favoritableId,
  favoritableType,
  favorite,
}: {
  favoritableId: number;
  favoritableType: 'movie' | 'tv_show';
  /** Watchlist/favorite entry id when already saved, otherwise null. */
  favorite: number | null;
}) {
  return (
    <ResourceToggleButton
      resourceId={favoritableId}
      resourceType={favoritableType}
      entryId={favorite}
      config={{
        endpoint: '/favorites',
        activeClass: 'text-rose-500',
        activeIcon: HEART_ACTIVE,
        activeLabel: 'Favorited',
        idleIcon: HEART_IDLE,
        idleLabel: 'Favorite',
      }}
    />
  );
}

export function WatchlistButton({
  watchableId,
  watchableType,
  watchable,
}: {
  watchableId: number;
  watchableType: 'movie' | 'tv_show';
  /** Watchlist/favorite entry id when already saved, otherwise null. */
  watchable: number | null;
}) {
  return (
    <ResourceToggleButton
      resourceId={watchableId}
      resourceType={watchableType}
      entryId={watchable}
      config={{
        endpoint: '/watchlist',
        activeClass: 'text-yellow-500',
        activeIcon: BOOKMARK_ACTIVE,
        activeLabel: 'Watchlisted',
        idleIcon: BOOKMARK_IDLE,
        idleLabel: 'Watchlist',
      }}
    />
  );
}
