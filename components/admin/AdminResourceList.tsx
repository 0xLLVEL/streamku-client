'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import { apiFetch } from '@/lib/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { BulkDeleteButton } from '@/components/admin/BulkDeleteButton';
import { ListFilterDropdown, type ListFilterField } from '@/components/admin/ListFilterDropdown';

export type AdminResourceType = 'movies' | 'tv-shows' | 'genres' | 'cast';

export interface AdminResourcePage<TData> {
  data: TData[];
  last_page?: number;
  total?: number;
}

export interface AdminResourceListProps<TData> {
  /** Heading shown above the table. */
  title: string;
  /** TanStack Query cache key prefix, e.g. `admin-movies`. */
  queryKey: string;
  /** API endpoint returning a paginated payload, e.g. `/admin/movies`. */
  endpoint: string;
  columns: ColumnDef<TData, unknown>[];
  createHref: string;
  createLabel: string;
  deleteType: AdminResourceType;
  /** Server-rendered first page used to avoid a loading flash. */
  initialData?: AdminResourcePage<TData>;
  /** Optional structured filters rendered in the toolbar dropdown. */
  filters?: ListFilterField[];
}

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 };

function extractRows<TData>(payload: AdminResourcePage<TData> | undefined): TData[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
}

/**
 * Shared paginated admin table with search, sorting, row selection and bulk delete.
 * All admin resource pages (movies, tv-shows, genres, cast) render through this.
 */
export function AdminResourceList<TData extends { id: number }>({
  title,
  queryKey,
  endpoint,
  columns,
  createHref,
  createLabel,
  deleteType,
  initialData,
  filters = [],
}: AdminResourceListProps<TData>) {
  const [pagination, setPagination] = React.useState(DEFAULT_PAGINATION);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});

  const hasDefaultState =
    sorting.length === 0 &&
    globalFilter === '' &&
    Object.keys(filterValues).length === 0 &&
    pagination.pageIndex === 0;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKey, pagination.pageIndex, pagination.pageSize, sorting, globalFilter, filterValues],
    queryFn: async (): Promise<AdminResourcePage<TData>> => {
      const params = buildQueryParams(pagination, sorting, globalFilter, filterValues);
      const res = await apiFetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) {
        return { data: [], last_page: 1, total: 0 };
      }
      return res.json();
    },
    placeholderData: keepPreviousData,
    initialData: hasDefaultState ? initialData : undefined,
  });

  const rows = extractRows<TData>(data);
  const pageCount = data?.last_page ?? -1;

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([index]) => rows[Number(index)]?.id)
    .filter((id): id is NonNullable<typeof id> => id != null);

  return (
    <div className="animate-in fade-in duration-500 w-full text-white font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <BulkDeleteButton
              selectedIds={selectedIds}
              type={deleteType}
              onSuccess={() => setRowSelection({})}
            />
          )}
          <Link
            href={createHref}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            {createLabel}
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        toolbarAction={
          filters.length > 0 ? (
            <ListFilterDropdown fields={filters} value={filterValues} onChange={setFilterValues} />
          ) : undefined
        }
        isLoading={isLoading || isFetching}
      />
    </div>
  );
}

function buildQueryParams(
  pagination: PaginationState,
  sorting: SortingState,
  globalFilter: string,
  filters: Record<string, string>,
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(pagination.pageIndex + 1),
    per_page: String(pagination.pageSize),
  });

  if (globalFilter) {
    params.append('search', globalFilter);
  }

  const primarySort = sorting[0];
  if (primarySort) {
    params.append('sort', primarySort.id);
    params.append('direction', primarySort.desc ? 'desc' : 'asc');
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.append(key, value);
    }
  }

  return params;
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}
