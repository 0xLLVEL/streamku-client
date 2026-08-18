'use client';

import * as React from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { columns, GenreType } from './columns';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';
import { BulkDeleteButton } from '@/components/admin/BulkDeleteButton';

export function GenresClient({ initialData }: { initialData: any }) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-genres', pagination.pageIndex, pagination.pageSize, sorting, globalFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', (pagination.pageIndex + 1).toString());
      params.append('per_page', pagination.pageSize.toString());
      
      if (globalFilter) {
        params.append('search', globalFilter);
      }
      
      if (sorting.length > 0) {
        params.append('sort', sorting[0].id);
        params.append('direction', sorting[0].desc ? 'desc' : 'asc');
      }
      
      const res = await fetchApi(`/admin/genres?${params.toString()}`);
      if (!res.ok) return { data: [], last_page: 1, total: 0 };
      const json = await res.json();
      return json;
    },
    placeholderData: keepPreviousData,
    initialData: sorting.length === 0 && !globalFilter && pagination.pageIndex === 0 ? initialData : undefined,
  });

  const rows = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  const pageCount = data?.last_page ?? -1;

  const selectedIds = Object.keys(rowSelection)
    .filter(index => rowSelection[index as keyof typeof rowSelection])
    .map(index => rows[parseInt(index)]?.id)
    .filter(Boolean);

  const handleBulkDeleteSuccess = () => {
    setRowSelection({});
  };

  return (
    <div className="animate-in fade-in duration-500 w-full text-white font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Genres</h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <BulkDeleteButton 
              selectedIds={selectedIds} 
              type="genres"
              onSuccess={handleBulkDeleteSuccess} 
            />
          )}
          <Link href="/admin/genres/create" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Genre
          </Link>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={rows} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading || isFetching}
      />
    </div>
  );
}
