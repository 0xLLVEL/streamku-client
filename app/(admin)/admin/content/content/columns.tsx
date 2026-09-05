'use client';

import * as React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { DeleteButton } from '@/components/admin/lists/DeleteButton';
import {
  dateColumn,
  genresColumn,
  posterTitleColumn,
  selectColumn,
  viewsColumn,
} from '@/components/admin/lists/table-columns';
import type { ContentRow } from './constants';
import { TypeBadge } from './TypeBadge';

export function useContentColumns(): ColumnDef<ContentRow, unknown>[] {
  return React.useMemo<ColumnDef<ContentRow, unknown>[]>(
    () => [
      selectColumn<ContentRow>(),
      posterTitleColumn<ContentRow>({
        header: 'Title',
        imagePath: (row) => row.poster_path,
        title: (row) => row.title,
        subtitleId: (row) => ({ tmdbId: row.tmdb_id, id: row.id }),
      }),
      {
        id: 'kind',
        header: 'Type',
        enableSorting: false,
        cell: ({ row }) => <TypeBadge kind={row.original.kind} />,
      },
      genresColumn<ContentRow>(),
      dateColumn<ContentRow>('release_date', 'Release / Air Date', 'strong'),
      viewsColumn<ContentRow>(),
      dateColumn<ContentRow>('created_at', 'Added At'),
      {
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200">
            <Link
              href={row.original.kind === 'movie' ? `/admin/movies/${row.original.id}` : `/admin/tv-shows/${row.original.id}`}
              className="text-white/60 hover:text-white px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/10 transition-colors duration-200 text-[11px] font-medium cursor-pointer focus-ring"
            >
              Edit
            </Link>
            <DeleteButton id={row.original.id} type={row.original.kind === 'movie' ? 'movies' : 'tv-shows'} />
          </div>
        ),
      },
    ],
    [],
  );
}
