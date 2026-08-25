import { fetchAdminPage } from '@/lib/api';
import { TvShowsClient, type TvShowType } from './TvShowsClient';

export default async function AdminTvShowsPage() {
  const tvShows = await fetchAdminPage<TvShowType>('/admin/tv-shows');
  return <TvShowsClient initialData={tvShows} />;
}
