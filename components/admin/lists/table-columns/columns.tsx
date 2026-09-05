'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DeleteButton } from '../DeleteButton';
import { formatTableDate } from './format';
import type { ActionsColumnOptions } from './types';

/** Formatted date cell (falls back to `-`). */
export function dateColumn<TData>(
  field: string,
  header: string,
  variant: 'strong' | 'muted' = 'muted',
): ColumnDef<TData, unknown> {
  return {
    accessorKey: field,
    header,
    meta: { className: 'whitespace-nowrap' },
    cell: ({ row }) => (
      <div className={variant === 'strong'
        ? 'text-white/80 font-medium text-[12px]'
        : 'text-white/50 text-[12px]'}
      >
        {formatTableDate(row.getValue(field))}
      </div>
    ),
  };
}

export function viewsColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    accessorKey: 'views',
    header: 'View Count',
    meta: { className: 'whitespace-nowrap' },
    cell: ({ row }) => {
      const views = Number(row.getValue('views') ?? 0);
      return <div className="text-white/50 text-[12px]">{views > 0 ? views.toLocaleString() : '-'}</div>;
    },
  };
}

/** Hover-revealed Edit/Delete actions column. */
export function actionsColumn<TData extends { id: number }>({
  editHref,
  deleteType,
}: ActionsColumnOptions): ColumnDef<TData, unknown> {
  return {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200">
        <Link
          href={editHref(row.original.id)}
          className="text-white/60 hover:text-white px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/10 transition-colors duration-200 text-[11px] font-medium cursor-pointer focus-ring"
        >
          Edit
        </Link>
        <DeleteButton id={row.original.id} type={deleteType} />
      </div>
    ),
  };
}
