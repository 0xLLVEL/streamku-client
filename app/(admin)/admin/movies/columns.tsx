'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';

export type MovieType = {
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres: { name: string }[];
  created_at: string;
};

export const columns: ColumnDef<MovieType>[] = [
  {
    accessorKey: 'title',
    header: 'Movie',
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => {
      const movie = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E1E2D] border border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-400 shrink-0 overflow-hidden">
            {movie.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
            ) : movie.title.charAt(0)}
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <div className="font-medium text-[13px] text-white leading-tight">{movie.title}</div>
            <div className="text-[11px] text-gray-500 leading-tight">{movie.tmdb_id ? `tmdb-${movie.tmdb_id}` : `id-${movie.id}`}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'genres',
    header: 'Genre',
    cell: ({ row }) => {
      const genres = row.getValue('genres') as { name: string }[];
      if (!genres || genres.length === 0) {
        return <span className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">Uncategorized</span>;
      }
      return (
        <div className="flex gap-1">
          {genres.slice(0, 2).map((g, i) => (
            <span key={i} className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">
              {g.name}
            </span>
          ))}
          {genres.length > 2 && (
            <span className="text-gray-500 text-[11px] font-medium py-0.5">+{genres.length - 2}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'release_date',
    header: 'Release Date',
    cell: ({ row }) => {
      const date = row.getValue('release_date') as string | null;
      return (
        <div className="text-white/80 font-medium text-[12px]">
          {date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'views',
    header: 'View Count',
    cell: ({ row }) => {
      const views = row.getValue('views') as number;
      return (
        <div className="text-gray-400 text-[12px]">
          {views > 0 ? views.toLocaleString() : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Added At',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string;
      return (
        <div className="text-gray-400 text-[12px]">
          {date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const movie = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/movies/${movie.id}`} className="text-white/50 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium">
            Edit
          </Link>
          <DeleteButton id={movie.id} type="movies" />
        </div>
      );
    },
  },
];
