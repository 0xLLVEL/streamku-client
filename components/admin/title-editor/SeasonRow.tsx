'use client';

import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config.utils';
import { ChevronRightIcon, SpinnerIcon, TrashIcon } from '@/components/ui/icons';
import type { SeasonEntry } from './types';

interface SeasonRowProps {
  season: SeasonEntry;
  tvShowId: number | null;
  deletingSeasonNumber: number | string | null;
  onDeleteSeason: (seasonNumber: number | string) => void;
}

/** Single season row: link wrapper when the show exists, plain div for previews. */
export function SeasonRow({ season, tvShowId, deletingSeasonNumber, onDeleteSeason }: SeasonRowProps) {
  const content = (
    <>
      <div className="w-12 shrink-0 bg-[#1e1e24] relative aspect-[2/3] rounded overflow-hidden">
        {season.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tmdbImageUrl(season.poster_path, 'w300') ?? undefined}
            className="w-full h-full object-cover"
            alt={season.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">
            No Photo
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-sm text-white truncate transition-colors ${tvShowId ? 'group-hover:text-red-400' : ''}`}
            title={season.name}
          >
            {season.name}
          </p>
          <p className="text-white/50 text-xs mt-1 truncate">{season.episode_count} Episodes</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40 shrink-0">
          {season.air_date && <span>{season.air_date.split('T')[0]}</span>}
        </div>
      </div>
      {tvShowId && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDeleteSeason(season.season_number);
            }}
            disabled={deletingSeasonNumber === season.season_number}
            className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors duration-200 z-10 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:text-red-400"
            title="Delete season"
            aria-label={`Delete ${season.name}`}
          >
            {deletingSeasonNumber === season.season_number ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
          <span className="text-white/20 group-hover:text-white/50 transition-colors">
            <ChevronRightIcon className="w-4 h-4" />
          </span>
        </div>
      )}
    </>
  );

  return tvShowId ? (
    <Link
      href={`/admin/tv-shows/${tvShowId}/seasons/${season.season_number}`}
      key={season.id}
      className="flex items-center gap-4 py-3 px-4 hover:bg-white/[0.03] transition-colors duration-200 group focus-ring"
    >
      {content}
    </Link>
  ) : (
    <div key={season.id} className="flex items-center gap-4 py-3 px-4 transition-colors">
      {content}
    </div>
  );
}
