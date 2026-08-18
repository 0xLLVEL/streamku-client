import { fetchApi } from '@/lib/api';
import { TvShowsClient } from './TvShowsClient';

async function getTvShows() {
  const res = await fetchApi('/admin/tv-shows', { next: { revalidate: 0 } });
  if (!res.ok) return { data: [], last_page: 1, total: 0 };
  const json = await res.json();
  return json || { data: [], last_page: 1, total: 0 };
}

export default async function AdminTvShowsPage() {
  const tvShows = await getTvShows();
  return <TvShowsClient initialData={tvShows} />;
}
