'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table } from '@/components/ui/Table';
import { AdminCard } from '@/components/admin/ui';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTablePagination } from './DataTablePagination';
import { DATA_TABLE_MIN_WIDTH_CLASS } from './constants';
import type { DataTableProps } from './types';

export type { DataTableProps } from './types';

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  rowSelection,
  onRowSelectionChange,
  isLoading,
  toolbarAction,
  enableSorting = true,
}: DataTableProps<TData, TValue>) {
  // TanStack Table's hook reports as "incompatible library" under the React
  // Compiler, but it's a false positive here (no memoized consumers).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: { globalFilter, sorting, pagination, rowSelection },
    enableRowSelection: true,
    enableSorting,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={onGlobalFilterChange}
        toolbarAction={toolbarAction}
      />
      <AdminCard className="relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
          </div>
        )}
        <Table className={DATA_TABLE_MIN_WIDTH_CLASS}>
          <DataTableHeader table={table} />
          <DataTableBody table={table} columnsLength={columns.length} />
        </Table>
      </AdminCard>
      <DataTablePagination table={table} />
    </div>
  );
}
