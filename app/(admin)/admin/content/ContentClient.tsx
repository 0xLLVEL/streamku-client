'use client';

import * as React from 'react';
import {
  AdminResourceList,
  type AdminResourcePage,
} from '@/components/admin/lists/AdminResourceList';
import { BulkDeleteButton } from '@/components/admin/lists/BulkDeleteButton';
import { cn } from '@/lib/utils';
import {
  FILTER_FIELDS,
  PAGE_SIZE_MERGED,
  PAGE_SIZE_SINGLE,
  RESERVED_PARAMS,
  TYPE_FILTERS,
  type ContentRow,
  type TypeFilter,
} from './content/constants';
import { useContentColumns } from './content/columns';
import { fetchKind } from './content/api';

export type { ContentKind, ContentRow } from './content/constants';
export { TypeBadge } from './content/TypeBadge';

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
  const columns = useContentColumns();

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
