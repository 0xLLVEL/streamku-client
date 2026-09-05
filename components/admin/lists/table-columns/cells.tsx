'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/Checkbox';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { HasGenres, PosterTitleColumnOptions } from './types';

const GENRE_CHIP_CLASS = 'bg-white/5 text-white/70 border border-white/5 px-2 py-0.5 rounded-md text-[11px] font-medium';

/** Row-selection checkbox column shared by every admin table. */
export function selectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(event) => table.toggleAllPageRowsSelected(!!event.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(event) => row.toggleSelected(!!event.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/** Avatar + title column used by movies, tv-shows and cast tables. */
export function posterTitleColumn<TData>({
  header,
  imagePath,
  title,
  subtitleId,
}: PosterTitleColumnOptions<TData>): ColumnDef<TData, unknown> {
  return {
    id: 'title',
    header,
    meta: { className: 'w-full' },
    cell: ({ row }) => {
      const item = row.original;
      const src = tmdbImageUrl(imagePath(item), 'w92');
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E1E2D] border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/50 shrink-0 overflow-hidden">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} className="w-full h-full object-cover" alt="" />
            ) : (
              title(item).charAt(0)
            )}
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <div className="font-medium text-[13px] text-white leading-tight">{title(item)}</div>
            <div className="text-[11px] text-white/40 leading-tight">
              {(() => {
                const { tmdbId, id } = subtitleId(item);
                return tmdbId ? `tmdb-${tmdbId}` : `id-${id}`;
              })()}
            </div>
          </div>
        </div>
      );
    },
  };
}

/** Genre chip list capped at two visible entries. */
export function genresColumn<TData extends HasGenres>(): ColumnDef<TData, unknown> {
  return {
    id: 'genres',
    header: 'Genre',
    enableSorting: false,
    cell: ({ row }) => {
      const genres = row.original.genres ?? [];
      if (genres.length === 0) {
        return <span className={GENRE_CHIP_CLASS}>Uncategorized</span>;
      }
      return (
        <div className="flex gap-1">
          {genres.slice(0, 2).map((genre, index) => (
            <span key={`${genre.name}-${index}`} className={GENRE_CHIP_CLASS}>
              {genre.name}
            </span>
          ))}
          {genres.length > 2 && (
            <span className="text-white/40 text-[11px] font-medium py-0.5">+{genres.length - 2}</span>
          )}
        </div>
      );
    },
  };
}
