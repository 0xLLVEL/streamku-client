'use client';

import { AdminResourceList, type AdminResourcePage } from '@/components/admin/AdminResourceList';
import {
  actionsColumn,
  dateColumn,
  genresColumn,
  posterTitleColumn,
  selectColumn,
  viewsColumn,
} from '@/components/admin/table-columns';
import { tmdbImageUrl } from '@/lib/config';
import type { ColumnDef } from '@tanstack/react-table';

export type TvShowType = {
  id: number;
  tmdb_id: number | null;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
  views: number;
  genres?: { name: string }[] | null;
  created_at: string;
};

const columns: ColumnDef<TvShowType, unknown>[] = [
  selectColumn<TvShowType>(),
  posterTitleColumn<TvShowType>({
    header: 'TV Show',
    imagePath: (show) => tmdbImageUrl(show.poster_path, 'w92'),
    title: (show) => show.name,
    subtitleId: (show) => ({ tmdbId: show.tmdb_id, id: show.id }),
  }),
  genresColumn<TvShowType>(),
  dateColumn<TvShowType>('first_air_date', 'Air Date', 'strong'),
  viewsColumn<TvShowType>(),
  dateColumn<TvShowType>('created_at', 'Added At'),
  actionsColumn<TvShowType>({
    editHref: (id) => `/admin/tv-shows/${id}`,
    deleteType: 'tv-shows',
  }),
];

export function TvShowsClient({ initialData }: { initialData?: AdminResourcePage<TvShowType> }) {
  return (
    <AdminResourceList<TvShowType>
      title="TV Shows"
      queryKey="admin-tv-shows"
      endpoint="/admin/tv-shows"
      columns={columns}
      createHref="/admin/tv-shows/create"
      createLabel="Add TV Show"
      deleteType="tv-shows"
      initialData={initialData}
      filters={[
        { kind: 'genres', key: 'genre', label: 'Genre' },
        { kind: 'number', key: 'year', label: 'Air Year', placeholder: 'e.g. 2024' },
        {
          kind: 'select',
          key: 'language',
          label: 'Language',
          options: [
            { value: 'en', label: 'English' },
            { value: 'id', label: 'Indonesian' },
            { value: 'ko', label: 'Korean' },
            { value: 'ja', label: 'Japanese' },
            { value: 'th', label: 'Thai' },
          ],
        },
      ]}
    />
  );
}
