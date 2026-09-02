'use client';

import { useResourceToggle } from '@/hooks/useResourceToggle';
import {
  StatefulToggleButton,
  resolveToggleAppearance,
} from '@/components/media/StatefulToggleButton';

interface FavoriteButtonProps {
  favoritableId: number;
  favoritableType: 'movie' | 'tv_show';
  /** Watchlist/favorite entry id when already saved, otherwise null. */
  favorite: number | null;
}

export function FavoriteButton({
  favoritableId,
  favoritableType,
  favorite,
}: FavoriteButtonProps) {
  const { isAdded, isLoading, isSuccess, toggle } = useResourceToggle({
    endpoint: '/favorites',
    resourceId: favoritableId,
    resourceType: favoritableType,
    initialEntryId: favorite,
  });

  const { className, icon, label } = resolveToggleAppearance(
    isAdded, isLoading, isSuccess,
    'text-rose-500',
    'Favorited',
    'Favorite',
    (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    ),
    (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
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
