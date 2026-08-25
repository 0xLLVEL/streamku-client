'use client';

import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config';
import type { SeasonEntry } from './types';

interface SeasonsTabProps {
  /** Present only when the TV show exists in the database. */
  tvShowId: number | null;
  seasons: SeasonEntry[] | null | undefined;
  deletingSeasonNumber: number | string | null;
  onDeleteSeason: (seasonNumber: number | string) => void;
}

/** Season list with edit links and delete action (TV shows only). */
export function SeasonsTab({
  tvShowId,
  seasons,
  deletingSeasonNumber,
  onDeleteSeason,
}: SeasonsTabProps) {
  const items = seasons ?? [];
  return (
    <div className="max-w-4xl space-y-8 motion-safe:animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Seasons ({items.length})</h2>
        {tvShowId && (
          <Link
            href={`/admin/tv-shows/${tvShowId}/seasons/create`}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 border border-white/10 cursor-pointer focus-ring"
          >
            Add Season
          </Link>
        )}
      </div>

      <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {items.map((season) => {
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
                      <SpinnerIcon />
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                  <ChevronRightIcon />
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
        })}

        {items.length === 0 && (
          <div className="p-8 text-center text-white/50 text-sm">No seasons available.</div>
        )}
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <div className="text-white/20 group-hover:text-white/50 transition-colors">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
