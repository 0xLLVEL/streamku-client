'use client';

import { AdminResourceList, type AdminResourcePage } from '@/components/admin/AdminResourceList';
import { actionsColumn, posterTitleColumn, selectColumn } from '@/components/admin/table-columns';
import { tmdbImageUrl } from '@/lib/config';
import type { ColumnDef } from '@tanstack/react-table';

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

const columns: ColumnDef<CastType, unknown>[] = [
  selectColumn<CastType>(),
  posterTitleColumn<CastType>({
    header: 'Cast Member',
    imagePath: (cast) => tmdbImageUrl(cast.profile_path, 'w92'),
    title: (cast) => cast.name,
    subtitleId: (cast) => ({ tmdbId: cast.tmdb_id, id: cast.id }),
  }),
  {
    accessorKey: 'character',
    header: 'Character',
    cell: ({ row }) => (
      <div className="text-gray-400 text-[12px] whitespace-nowrap">
        {row.getValue('character') ?? '-'}
      </div>
    ),
  },
  {
    id: 'castable',
    header: 'Movie / TV Show',
    enableSorting: false,
    cell: ({ row }) => {
      const { castable, castable_type } = row.original;
      if (!castable) {
        return <span className="text-gray-500 text-[12px]">-</span>;
      }
      const typeLabel = castable_type?.includes('Movie') ? 'Movie' : 'TV Show';
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-white/80 whitespace-nowrap">
            {castable.title ?? castable.name ?? 'Unknown'}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{typeLabel}</span>
        </div>
      );
    },
  },
  actionsColumn<CastType>({
    editHref: (id) => `/admin/cast/${id}`,
    deleteType: 'cast',
  }),
];

export function CastClient({ initialData }: { initialData?: AdminResourcePage<CastType> }) {
  return (
    <AdminResourceList<CastType>
      title="Cast"
      queryKey="admin-cast"
      endpoint="/admin/cast"
      columns={columns}
      createHref="/admin/cast/create"
      createLabel="Add Cast Member"
      deleteType="cast"
      initialData={initialData}
    />
  );
}
