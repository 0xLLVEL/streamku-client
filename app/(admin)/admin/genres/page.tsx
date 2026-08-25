import { fetchAdminPage } from '@/lib/api';
import { GenresClient, type GenreType } from './GenresClient';

export default async function AdminGenresPage() {
  const genres = await fetchAdminPage<GenreType>('/admin/genres');
  return <GenresClient initialData={genres} />;
}
