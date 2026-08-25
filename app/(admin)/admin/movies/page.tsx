import { fetchAdminPage } from '@/lib/api';
import { MoviesClient, type MovieType } from './MoviesClient';

export default async function AdminMoviesPage() {
  const movies = await fetchAdminPage<MovieType>('/admin/movies');
  return <MoviesClient initialData={movies} />;
}
