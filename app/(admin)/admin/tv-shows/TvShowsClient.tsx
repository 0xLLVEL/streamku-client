'use client';

import * as React from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { columns, TvShowType } from './columns';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';
import { BulkDeleteButton } from '@/components/admin/BulkDeleteButton';

export function TvShowsClient({ initialData }: { initialData: any }) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-tv-shows', pagination.pageIndex, pagination.pageSize, sorting, globalFilter, filters],
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
      
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.year) params.append('year', filters.year);
      if (filters.language) params.append('language', filters.language);

      const res = await fetchApi(`/admin/tv-shows?${params.toString()}`);
      if (!res.ok) return { data: [], last_page: 1, total: 0 };
      const json = await res.json();
      return json;
    },
    placeholderData: keepPreviousData,
    initialData: Object.keys(filters).length === 0 && sorting.length === 0 && !globalFilter && pagination.pageIndex === 0 ? initialData : undefined,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
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
        <h1 className="text-xl font-semibold">TV Shows</h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <BulkDeleteButton 
              selectedIds={selectedIds} 
              type="tv-shows"
              onSuccess={handleBulkDeleteSuccess} 
            />
          )}
          <Link href="/admin/tv-shows/create" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add TV Show
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
        toolbarAction={<FilterDropdown filters={filters} setFilters={setFilters} />}
        isLoading={isLoading || isFetching}
      />
    </div>
  );
}

function FilterDropdown({ filters, setFilters }: { filters: Record<string, string>, setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [genres, setGenres] = React.useState<{id: number, name: string}[]>([]);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchApi('/genres').then(res => res.json()).then(data => setGenres(data.data || data));
  }, []);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
        {Object.keys(filters).length > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {Object.keys(filters).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-[#111] border border-white/10 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            <button onClick={() => setFilters({})} className="text-xs text-red-500 hover:text-red-400">Clear all</button>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Genre</label>
            <select 
              value={filters.genre || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => {
                  const next = { ...prev };
                  if (val) next.genre = val; else delete next.genre;
                  return next;
                });
              }}
              className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Air Year</label>
            <input 
              type="number"
              placeholder="e.g. 2023"
              value={filters.year || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => {
                  const next = { ...prev };
                  if (val) next.year = val; else delete next.year;
                  return next;
                });
              }}
              className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Original Language</label>
            <select 
              value={filters.language || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => {
                  const next = { ...prev };
                  if (val) next.language = val; else delete next.language;
                  return next;
                });
              }}
              className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="id">Indonesian</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
              <option value="th">Thai</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
