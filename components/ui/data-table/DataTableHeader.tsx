'use client';

import { flexRender, type Table } from '@tanstack/react-table';
import { TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export function DataTableHeader<TData>({ table }: { table: Table<TData> }) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                {header.isPlaceholder
                  ? null
                  : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-2 cursor-pointer select-none group/sort hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:text-white w-full text-left"
                            : "flex items-center gap-2 w-full text-left"
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>,
                          desc: <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>,
                        }[header.column.getIsSorted() as string] ?? (
                          header.column.getCanSort() ? <svg className="w-3.5 h-3.5 opacity-0 group-hover/sort:opacity-50 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg> : null
                        )}
                      </button>
                    )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
