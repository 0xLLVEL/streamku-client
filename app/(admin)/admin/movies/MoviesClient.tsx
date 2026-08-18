'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/apiClient';
import { columns, MovieType } from './columns';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';

export function MoviesClient({ initialData }: { initialData: MovieType[] }) {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const res = await fetchApi('/admin/movies');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    initialData,
  });

  return (
    <div className="animate-in fade-in duration-500 w-full text-white font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Movies</h1>
        <Link href="/admin/movies/create" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add movie
        </Link>
      </div>

      <DataTable columns={columns} data={movies} />
    </div>
  );
}
