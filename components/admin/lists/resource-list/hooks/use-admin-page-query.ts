'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { apiFetch } from '@/lib/api-client.utils';
import { buildQueryParams } from '../utils/build-query-params';
import type { AdminResourcePage } from '../types';

function extractRows<TData>(payload: AdminResourcePage<TData> | undefined): TData[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
}

interface UseAdminPageQueryOptions<TData> {
  queryKey: string;
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  filterValues: Record<string, string>;
  initialSearch?: string;
  endpoint?: string;
  fetchPage?: (params: URLSearchParams) => Promise<AdminResourcePage<TData>>;
  initialData?: AdminResourcePage<TData>;
}

export function useAdminPageQuery<TData>({
  queryKey,
  pagination,
  sorting,
  globalFilter,
  filterValues,
  initialSearch = '',
  endpoint,
  fetchPage,
  initialData,
}: UseAdminPageQueryOptions<TData>) {
  const hasDefaultState =
    sorting.length === 0 &&
    globalFilter === initialSearch &&
    Object.keys(filterValues).length === 0 &&
    pagination.pageIndex === 0;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKey, pagination.pageIndex, pagination.pageSize, sorting, globalFilter, filterValues],
    queryFn: async (): Promise<AdminResourcePage<TData>> => {
      const params = buildQueryParams(pagination, sorting, globalFilter, filterValues);
      if (fetchPage) {
        return fetchPage(params);
      }
      const res = await apiFetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) {
        return { data: [], last_page: 1, total: 0 };
      }
      return res.json();
    },
    placeholderData: keepPreviousData,
    initialData: hasDefaultState ? initialData : undefined,
  });

  return {
    rows: extractRows<TData>(data),
    pageCount: data?.last_page ?? -1,
    isLoading,
    isFetching,
  };
}
