'use client';

import { AdminResourceList, type AdminResourcePage } from '@/components/admin/lists/AdminResourceList';
import {
  actionsColumn,
  dateColumn,
  genresColumn,
  posterTitleColumn,
  selectColumn,
  viewsColumn,
} from '@/components/admin/lists/table-columns';
import { tmdbImageUrl } from '@/lib/config';
import type { ColumnDef } from '@tanstack/react-table';

export type MovieType = {
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres?: { name: string }[] | null;
  created_at: string;
};

const columns: ColumnDef<MovieType, unknown>[] = [
  selectColumn<MovieType>(),
  posterTitleColumn<MovieType>({
    header: 'Movie',
    imagePath: (movie) => tmdbImageUrl(movie.poster_path, 'w92'),
    title: (movie) => movie.title,
    subtitleId: (movie) => ({ tmdbId: movie.tmdb_id, id: movie.id }),
  }),
  genresColumn<MovieType>(),
  dateColumn<MovieType>('release_date', 'Release Date', 'strong'),
  viewsColumn<MovieType>(),
  dateColumn<MovieType>('created_at', 'Added At'),
  actionsColumn<MovieType>({
    editHref: (id) => `/admin/movies/${id}`,
    deleteType: 'movies',
  }),
];

export function MoviesClient({ initialData }: { initialData?: AdminResourcePage<MovieType> }) {
  return (
    <AdminResourceList<MovieType>
      title="Movies"
      queryKey="admin-movies"
      endpoint="/admin/movies"
      columns={columns}
      createHref="/admin/movies/create"
      createLabel="Add movie"
      deleteType="movies"
      initialData={initialData}
      filters={[
        { kind: 'genres', key: 'genre', label: 'Genre' },
        { kind: 'number', key: 'year', label: 'Year', placeholder: 'e.g. 2024' },
        {
          kind: 'select',
          key: 'language',
          label: 'Language',
          options: [
            { value: 'en', label: 'English' },
            { value: 'id', label: 'Indonesian' },
            { value: 'ko', label: 'Korean' },
            { value: 'ja', label: 'Japanese' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
          ],
        },
      ]}
    />
  );
}
