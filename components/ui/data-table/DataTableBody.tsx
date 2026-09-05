'use client';

import { flexRender, type Table } from '@tanstack/react-table';
import { TableBody, TableCell, TableRow } from '@/components/ui/Table';

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columnsLength: number;
}

export function DataTableBody<TData>({ table, columnsLength }: DataTableBodyProps<TData>) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columnsLength} className="h-28 text-center text-white/50">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
