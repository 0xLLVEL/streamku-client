'use client';

import { AdminResourceList, type AdminResourcePage } from '@/components/admin/AdminResourceList';
import { actionsColumn, selectColumn } from '@/components/admin/table-columns';
import type { ColumnDef } from '@tanstack/react-table';

export type GenreType = {
  id: number;
  name: string;
  slug: string;
};

const columns: ColumnDef<GenreType, unknown>[] = [
  selectColumn<GenreType>(),
  {
    id: 'title',
    header: 'Genre',
    meta: { className: 'w-full' },
    cell: ({ row }) => (
      <div className="flex flex-col justify-center gap-0.5">
        <div className="font-medium text-[13px] text-white leading-tight">{row.original.name}</div>
        <div className="text-[11px] text-gray-500 leading-tight">id-{row.original.id}</div>
      </div>
    ),
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <div className="text-gray-400 text-[12px] whitespace-nowrap">{row.getValue('slug')}</div>
    ),
  },
  actionsColumn<GenreType>({
    editHref: (id) => `/admin/genres/${id}`,
    deleteType: 'genres',
  }),
];

export function GenresClient({ initialData }: { initialData?: AdminResourcePage<GenreType> }) {
  return (
    <AdminResourceList<GenreType>
      title="Genres"
      queryKey="admin-genres"
      endpoint="/admin/genres"
      columns={columns}
      createHref="/admin/genres/create"
      createLabel="Add Genre"
      deleteType="genres"
      initialData={initialData}
    />
  );
}
