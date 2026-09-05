import type { PaginationState, SortingState } from '@tanstack/react-table';

export function buildQueryParams(
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
