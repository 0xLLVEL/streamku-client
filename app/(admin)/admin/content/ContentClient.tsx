'use client';

import * as React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { apiFetch } from '@/lib/apiClient';
import {
  AdminResourceList,
  type AdminResourcePage,
} from '@/components/admin/lists/AdminResourceList';
import { BulkDeleteButton } from '@/components/admin/lists/BulkDeleteButton';
import { DeleteButton } from '@/components/admin/lists/DeleteButton';
import type { ListFilterField } from '@/components/admin/lists/ListFilterDropdown';
import {
  dateColumn,
  genresColumn,
  posterTitleColumn,
  selectColumn,
  viewsColumn,
} from '@/components/admin/lists/table-columns';
import { cn } from '@/lib/utils';

export type ContentKind = 'movie' | 'tv';

export interface ContentRow {
  kind: ContentKind;
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres: { name: string }[] | null;
  created_at: string;
}

type TypeFilter = 'all' | 'movie' | 'tv';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

const PAGE_SIZE_SINGLE = 20;
// Merged view pulls this many per endpoint so the combined page stays at 20 rows.
const PAGE_SIZE_MERGED = 10;

const FILTER_FIELDS: ListFilterField[] = [
  { kind: 'genres', key: 'genre', label: 'Genre' },
  { kind: 'number', key: 'year', label: 'Year', placeholder: 'e.g. 2024' },
  {
    kind: 'select',
    key: 'language',
    label: 'Language',
    options: [
      { value: 'en', label: 'English' },
      { value: 'id', label: 'Indonesian' },
      { value: 'ko', label: 'Korean' },
      { value: 'ja', label: 'Japanese' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
    ],
  },
];

const RESERVED_PARAMS = new Set(['page', 'per_page', 'search', 'sort', 'direction']);

interface ContentClientProps {
  /** Server-rendered first page of the merged "All" view. */
  initialRows: ContentRow[];
  initialPageCount: number;
  /** Pre-filled from the top-bar global search (?search=). */
  initialSearch?: string;
}

/**
 * Merged Movies + TV Shows admin table. All table machinery (pagination,
 * search, selection, bulk delete) lives in AdminResourceList; this only
 * supplies the content-specific bits: the type filter, the dual-endpoint
 * fetch and the mixed-kind bulk delete.
 */
export function ContentClient({ initialRows, initialPageCount, initialSearch = '' }: ContentClientProps) {
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');

  const columns = React.useMemo<ColumnDef<ContentRow, unknown>[]>(
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
          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
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

  const fetchPage = React.useCallback(
    (params: URLSearchParams): Promise<AdminResourcePage<ContentRow>> => {
      const page = Number(params.get('page') ?? 1);
      const search = params.get('search') ?? '';
      const sort = params.get('sort') ?? 'created_at';
      const direction = (params.get('direction') ?? 'asc') as 'asc' | 'desc';
      const filters: Record<string, string> = {};
      params.forEach((value, key) => {
        if (!RESERVED_PARAMS.has(key) && value) filters[key] = value;
      });

      if (typeFilter !== 'all') {
        const endpoint = typeFilter === 'movie' ? 'movies' : 'tv-shows';
        // The merged column id is `release_date`; the TV API expects `first_air_date`.
        const sortId =
          endpoint === 'tv-shows' && sort === 'release_date' ? 'first_air_date' : sort;
        return fetchKind(endpoint, page, PAGE_SIZE_SINGLE, search, filters, sortId, direction);
      }

      // No combined API: pull the same page from both endpoints and merge.
      return Promise.all([
        fetchKind('movies', page, PAGE_SIZE_MERGED, search, filters, 'created_at', 'desc'),
        fetchKind('tv-shows', page, PAGE_SIZE_MERGED, search, filters, 'created_at', 'desc'),
      ]).then(([movies, tvShows]) => ({
        data: [...movies.data, ...tvShows.data].sort((a, b) =>
          (b.created_at ?? '').localeCompare(a.created_at ?? ''),
        ),
        last_page: Math.max(movies.last_page ?? 1, tvShows.last_page ?? 1),
      }));
    },
    [typeFilter],
  );

  return (
    <AdminResourceList<ContentRow>
      key={typeFilter}
      title="Titles"
      description="Movies and TV shows in one catalog"
      queryKey={`admin-content-${typeFilter}`}
      columns={columns}
      createHref="/admin/content/create"
      createLabel="Add Title"
      deleteType="movies"
      initialData={
        typeFilter === 'all' ? { data: initialRows, last_page: initialPageCount } : undefined
      }
      initialSearch={initialSearch}
      fetchPage={fetchPage}
      enableSorting={typeFilter !== 'all'}
      toolbarAction={
        <div className="flex bg-black/30 border border-white/10 rounded-lg p-0.5" role="group" aria-label="Filter by type">
          {TYPE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTypeFilter(option.value)}
              aria-pressed={typeFilter === option.value}
              className={cn(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 cursor-pointer focus-ring',
                typeFilter === option.value
                  ? 'bg-red-600 text-white shadow-[0_2px_10px_0_rgba(220,38,38,0.35)]'
                  : 'text-white/50 hover:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
      filters={FILTER_FIELDS}
      renderBulkActions={(selected, resetSelection) => {
        const movieIds = selected.filter((row) => row.kind === 'movie').map((row) => row.id);
        const tvIds = selected.filter((row) => row.kind === 'tv').map((row) => row.id);
        return (
          <>
            {movieIds.length > 0 && (
              <BulkDeleteButton selectedIds={movieIds} type="movies" onSuccess={resetSelection} />
            )}
            {tvIds.length > 0 && (
              <BulkDeleteButton selectedIds={tvIds} type="tv-shows" onSuccess={resetSelection} />
            )}
          </>
        );
      }}
    />
  );
}

async function fetchKind(
  endpoint: 'movies' | 'tv-shows',
  page: number,
  perPage: number,
  search: string,
  filters: Record<string, string>,
  sort: string,
  direction: 'asc' | 'desc',
): Promise<AdminResourcePage<ContentRow>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort,
    direction,
  });
  if (search) params.append('search', search);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.append(key, value);
  }

  const res = await apiFetch(`/admin/${endpoint}?${params.toString()}`);
  if (!res.ok) return { data: [], last_page: 1 };

  const payload = await res.json();
  const apiRows: unknown[] = Array.isArray(payload?.data) ? payload.data : [];

  const data = apiRows
    .map((raw) => normalizeRow(endpoint, raw))
    .filter((row): row is ContentRow => row !== null);

  return { data, last_page: Number(payload?.last_page) || 1 };
}

function normalizeRow(endpoint: 'movies' | 'tv-shows', raw: unknown): ContentRow | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  if (!Number.isFinite(id)) return null;

  return {
    kind: endpoint === 'movies' ? 'movie' : 'tv',
    id,
    tmdb_id: record.tmdb_id != null ? Number(record.tmdb_id) : null,
    title: String(record.title ?? record.name ?? 'Untitled'),
    poster_path: typeof record.poster_path === 'string' ? record.poster_path : null,
    release_date: typeof (record.release_date ?? record.first_air_date) === 'string'
      ? (record.release_date ?? record.first_air_date) as string
      : null,
    views: Number(record.views ?? 0),
    genres: Array.isArray(record.genres)
      ? (record.genres as { name: string }[])
      : null,
    created_at: typeof record.created_at === 'string' ? record.created_at : '',
  };
}

export function TypeBadge({ kind }: { kind: ContentKind }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-semibold',
        kind === 'movie'
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          : 'bg-red-600/10 border-red-500/20 text-red-400',
      )}
    >
      {kind === 'movie' ? 'Movie' : 'TV Show'}
    </span>
  );
}