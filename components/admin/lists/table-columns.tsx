'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DeleteButton } from './DeleteButton';
import { Checkbox } from '@/components/ui/Checkbox';
import { tmdbImageUrl } from '@/lib/config';
import type { AdminResourceType } from './AdminResourceList';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatTableDate(value: string | null | undefined): string {
  return value ? dateFormatter.format(new Date(value)) : '-';
}

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

interface PosterTitleColumnOptions<TData> {
  header: string;
  imagePath: (row: TData) => string | null;
  title: (row: TData) => string;
  subtitleId: (row: TData) => { tmdbId: number | null; id: number };
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

const GENRE_CHIP_CLASS = 'bg-white/5 text-white/70 border border-white/5 px-2 py-0.5 rounded-md text-[11px] font-medium';

export interface HasGenres {
  genres?: { name: string }[] | null;
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

/** Formatted date cell (falls back to `-`). */
export function dateColumn<TData>(
  field: string,
  header: string,
  variant: 'strong' | 'muted' = 'muted',
): ColumnDef<TData, unknown> {
  return {
    accessorKey: field,
    header,
    meta: { className: 'whitespace-nowrap' },
    cell: ({ row }) => (
      <div className={variant === 'strong'
        ? 'text-white/80 font-medium text-[12px]'
        : 'text-white/50 text-[12px]'}
      >
        {formatTableDate(row.getValue(field))}
      </div>
    ),
  };
}

export function viewsColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    accessorKey: 'views',
    header: 'View Count',
    meta: { className: 'whitespace-nowrap' },
    cell: ({ row }) => {
      const views = Number(row.getValue('views') ?? 0);
      return <div className="text-white/50 text-[12px]">{views > 0 ? views.toLocaleString() : '-'}</div>;
    },
  };
}

interface ActionsColumnOptions {
  editHref: (id: number) => string;
  deleteType: AdminResourceType;
}

/** Hover-revealed Edit/Delete actions column. */
export function actionsColumn<TData extends { id: number }>({
  editHref,
  deleteType,
}: ActionsColumnOptions): ColumnDef<TData, unknown> {
  return {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200">
        <Link
          href={editHref(row.original.id)}
          className="text-white/60 hover:text-white px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/10 transition-colors duration-200 text-[11px] font-medium cursor-pointer focus-ring"
        >
          Edit
        </Link>
        <DeleteButton id={row.original.id} type={deleteType} />
      </div>
    ),
  };
}
