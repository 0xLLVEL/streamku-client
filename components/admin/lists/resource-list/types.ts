import type * as React from 'react';
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import type { ListFilterField } from '../ListFilterDropdown';

export type AdminResourceType = 'movies' | 'tv-shows' | 'genres' | 'cast';

export interface AdminResourcePage<TData> {
  data: TData[];
  last_page?: number;
  total?: number;
}

export interface AdminResourceListProps<TData> {
  /** Heading shown above the table. */
  title: string;
  /** Extra line under the heading. */
  description?: string;
  /** TanStack Query cache key prefix, e.g. `admin-movies`. */
  queryKey: string;
  /** API endpoint returning a paginated payload, e.g. `/admin/movies`. Ignored when `fetchPage` is used. */
  endpoint?: string;
  columns: ColumnDef<TData, unknown>[];
  createHref: string;
  createLabel: string;
  deleteType: AdminResourceType;
  /** Server-rendered first page used to avoid a loading flash. */
  initialData?: AdminResourcePage<TData>;
  /** Optional structured filters rendered in the toolbar dropdown. */
  filters?: ListFilterField[];
  /** Seed for the search box (e.g. from a top-bar `?search=`). */
  initialSearch?: string;
  /** Override the default fetching logic; receives the same query params. */
  fetchPage?: (params: URLSearchParams) => Promise<AdminResourcePage<TData>>;
  /** Extra toolbar content rendered before the filter dropdown. */
  toolbarAction?: React.ReactNode;
  /** Disable column sorting entirely (e.g. client-merged data). */
  enableSorting?: boolean;
  /** Replace the single-type bulk delete (e.g. mixed-kind selections). */
  renderBulkActions?: (selected: TData[], resetSelection: () => void) => React.ReactNode;
}

export type { PaginationState, RowSelectionState, SortingState };
