'use client';

import type { Table } from '@tanstack/react-table';

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-white/40 font-medium">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() === -1 ? '?' : table.getPageCount()}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200 text-white text-xs font-medium cursor-pointer focus-ring"
        >
          Previous
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200 text-white text-xs font-medium cursor-pointer focus-ring"
        >
          Next
        </button>
      </div>
    </div>
  );
}
