import { fetchApi } from '@/lib/api';
import { GenresClient } from './GenresClient';

async function getGenres() {
  const res = await fetchApi('/admin/genres?per_page=20', { next: { revalidate: 0 } });
  if (!res.ok) return { data: [], last_page: 1, total: 0 };
  const json = await res.json();
  return json || { data: [], last_page: 1, total: 0 };
}

export default async function AdminGenresPage() {
  const genres = await getGenres();
  return <GenresClient initialData={genres} />;
}
