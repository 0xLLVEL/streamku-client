'use client';

import { useResourceToggle } from '@/hooks/useResourceToggle';
import {
  CheckIcon,
  SpinnerIcon,
  StatefulToggleButton,
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
    resourceKey: 'watchlistable',
    resourceId: watchableId,
    resourceType: watchableType,
    initialEntryId: watchable,
  });

  const { className, icon, label } = resolveAppearance(isAdded, isLoading, isSuccess);

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

function resolveAppearance(
  isAdded: boolean,
  isLoading: boolean,
  isSuccess: boolean,
): { className: string; icon: React.ReactNode; label: string } {
  if (isLoading) {
    return { className: 'liquid-glass hover:bg-white/20 text-white', icon: <SpinnerIcon />, label: 'Loading' };
  }

  if (isSuccess) {
    return isAdded
      ? { className: 'bg-green-600 hover:bg-green-700 text-white', icon: <CheckIcon />, label: 'Added' }
      : { className: 'bg-red-600 hover:bg-red-700 text-white', icon: <CheckIcon />, label: 'Removed' };
  }

  return isAdded
    ? {
        className: 'liquid-glass hover:bg-white/20 text-yellow-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        ),
        label: 'Watchlisted',
      }
    : {
        className: 'liquid-glass hover:bg-white/20 text-white',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        ),
        label: 'Watchlist',
      };
}
