import { fetchAdminPage } from '@/lib/api';
import { GenresClient, type GenreType } from './GenresClient';

export default async function AdminGenresPage() {
  // Genre lists are small; pull a large page for the tile grid.
  const genres = await fetchAdminPage<GenreType>('/admin/genres', 100);
  return <GenresClient initialGenres={genres.data ?? []} />;
}
