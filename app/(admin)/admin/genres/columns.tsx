'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Checkbox } from '@/components/ui/checkbox';

export type GenreType = {
  id: number;
  name: string;
  slug: string;
};

export const columns: ColumnDef<GenreType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Genre',
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => {
      const genre = row.original;
      return (
        <div className="flex flex-col justify-center gap-0.5">
          <div className="font-medium text-[13px] text-white leading-tight">{genre.name}</div>
          <div className="text-[11px] text-gray-500 leading-tight">id-{genre.id}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => {
      const slug = row.getValue('slug') as string;
      return (
        <div className="text-gray-400 text-[12px] whitespace-nowrap">
          {slug}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const genre = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/genres/${genre.id}`} className="text-white/50 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium">
            Edit
          </Link>
          <DeleteButton id={genre.id} type="genres" />
        </div>
      );
    },
  },
];
