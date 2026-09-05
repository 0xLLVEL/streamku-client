'use client';

import * as React from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { ListFilterDropdown } from '../ListFilterDropdown';
import { ResourceHeader } from './ResourceHeader';
import { DEFAULT_PAGINATION } from './constants';
import { useAdminPageQuery } from './hooks/use-admin-page-query';
import { useRowSelection } from './hooks/use-row-selection';
import type { AdminResourceListProps } from './types';

export type { AdminResourceListProps, AdminResourcePage, AdminResourceType } from './types';

/** Shared paginated admin table: search, sorting, selection, bulk delete. */
export function AdminResourceList<TData extends { id: number }>({
  title, description, queryKey, endpoint, columns, createHref, createLabel,
  deleteType, initialData, filters = [], initialSearch = '', fetchPage,
  toolbarAction, enableSorting, renderBulkActions,
}: AdminResourceListProps<TData>) {
  const [pagination, setPagination] = React.useState<PaginationState>(DEFAULT_PAGINATION);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(initialSearch);
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const { rows, pageCount, isLoading, isFetching } = useAdminPageQuery<TData>({
    queryKey, pagination, sorting, globalFilter, filterValues,
    initialSearch, endpoint, fetchPage, initialData,
  });
  const { rowSelection, setRowSelection, resetSelection, selectedRows, selectedIds } = useRowSelection(rows);

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <ResourceHeader
        title={title} description={description} selectedRows={selectedRows}
        selectedIds={selectedIds} resetSelection={resetSelection} createHref={createHref}
        createLabel={createLabel} deleteType={deleteType} renderBulkActions={renderBulkActions}
      />
      <DataTable
        columns={columns} data={rows} pageCount={pageCount}
        pagination={pagination} onPaginationChange={setPagination}
        sorting={sorting} onSortingChange={setSorting}
        globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection} onRowSelectionChange={setRowSelection}
        toolbarAction={
          toolbarAction || filters.length > 0 ? (
            <>
              {toolbarAction}
              {filters.length > 0 && (
                <ListFilterDropdown fields={filters} value={filterValues} onChange={setFilterValues} />
              )}
            </>
          ) : undefined
        }
        isLoading={isLoading || isFetching}
        enableSorting={enableSorting}
      />
    </div>
  );
}
