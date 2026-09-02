'use client';

import { useResourceToggle } from '@/hooks/useResourceToggle';
import {
  StatefulToggleButton,
  resolveToggleAppearance,
} from '@/components/media/StatefulToggleButton';

interface WatchlistButtonProps {
  watchableId: number;
  watchableType: 'movie' | 'tv_show';
  /** Watchlist/favorite entry id when already saved, otherwise null. */
  watchable: number | null;
}

export function WatchlistButton({
  watchableId,
  watchableType,
  watchable,
}: WatchlistButtonProps) {
  const { isAdded, isLoading, isSuccess, toggle } = useResourceToggle({
    endpoint: '/watchlist',
    resourceId: watchableId,
    resourceType: watchableType,
    initialEntryId: watchable,
  });

  const { className, icon, label } = resolveToggleAppearance(
    isAdded, isLoading, isSuccess,
    'text-yellow-500',
    'Watchlisted',
    'Watchlist',
    (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    ),
    (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    ),
  );

  return (
    <StatefulToggleButton
      onClick={() => void toggle()}
      disabled={isLoading || isSuccess}
      className={className}
      icon={icon}
      label={label}
    />
  );
}
