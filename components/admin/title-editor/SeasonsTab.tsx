'use client';

import Link from 'next/link';
import { SeasonRow } from './SeasonRow';
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
        {items.map((season) => (
          <SeasonRow
            key={season.id}
            season={season}
            tvShowId={tvShowId}
            deletingSeasonNumber={deletingSeasonNumber}
            onDeleteSeason={onDeleteSeason}
          />
        ))}

        {items.length === 0 && (
          <div className="p-8 text-center text-white/50 text-sm">No seasons available.</div>
        )}
      </div>
    </div>
  );
}
