'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Checkbox } from '@/components/ui/checkbox';

export type CastType = {
  id: number;
  tmdb_id: number | null;
  name: string;
  character: string | null;
  profile_path: string | null;
  created_at: string;
  castable?: {
    id: number;
    title?: string;
    name?: string;
  };
  castable_type?: string;
};

export const columns: ColumnDef<CastType>[] = [
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
    header: 'Cast Member',
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => {
      const cast = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E1E2D] border border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-400 shrink-0 overflow-hidden">
            {cast.profile_path ? (
              <img src={`https://image.tmdb.org/t/p/w92${cast.profile_path}`} className="w-full h-full object-cover" alt="" />
            ) : cast.name.charAt(0)}
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <div className="font-medium text-[13px] text-white leading-tight">{cast.name}</div>
            <div className="text-[11px] text-gray-500 leading-tight">{cast.tmdb_id ? `tmdb-${cast.tmdb_id}` : `id-${cast.id}`}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'character',
    header: 'Character',
    cell: ({ row }) => {
      const character = row.getValue('character') as string | null;
      return (
        <div className="text-gray-400 text-[12px] whitespace-nowrap">
          {character || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'castable',
    header: 'Movie / TV Show',
    enableSorting: false,
    cell: ({ row }) => {
      const cast = row.original;
      if (!cast.castable) {
        return <span className="text-gray-500 text-[12px]">-</span>;
      }
      
      const typeLabel = cast.castable_type?.includes('Movie') ? 'Movie' : 'TV Show';
      const title = cast.castable.title || cast.castable.name || 'Unknown';
      
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-white/80 whitespace-nowrap">{title}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{typeLabel}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const cast = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/cast/${cast.id}`} className="text-white/50 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium">
            Edit
          </Link>
          <DeleteButton id={cast.id} type="cast" />
        </div>
      );
    },
  },
];
