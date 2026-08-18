import { fetchApi } from '@/lib/api';
import { MoviesClient } from './MoviesClient';

async function getMovies() {
  const res = await fetchApi('/admin/movies', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function AdminMoviesPage() {
  const movies = await getMovies();
  return <MoviesClient initialData={movies} />;
}
