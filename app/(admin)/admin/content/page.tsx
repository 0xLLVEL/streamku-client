import { fetchApi, fetchAdminPage } from '@/lib/api.utils';
import { normalizeContentRow, type ContentRowInput } from '@/lib/normalize-content.utils';
import { StatCard } from '@/components/admin/ui';
import { ContentClient } from './ContentClient';
import { FilmIcon, ReelIcon, TagIcon, TvIcon } from './ContentStatIcons';

interface MovieApiRow extends ContentRowInput {
  title: string;
  release_date: string | null;
}

interface TvApiRow extends ContentRowInput {
  name: string;
  first_air_date: string | null;
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const [movies, tvShows] = await Promise.all([
    fetchAdminPage<MovieApiRow>('/admin/movies'),
    fetchAdminPage<TvApiRow>('/admin/tv-shows'),
  ]);

  let genreCount = 0;
  try {
    const res = await fetchApi('/genres');
    if (res.ok) {
      const json = await res.json();
      genreCount = Array.isArray(json?.data) ? json.data.length : 0;
    }
  } catch {
    // Genre count is decorative; ignore failures.
  }

  const initialRows = [
    ...(movies.data ?? []).map((row) => normalizeContentRow(row, 'movie')),
    ...(tvShows.data ?? []).map((row) => normalizeContentRow(row, 'tv')),
  ].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));

  const initialPageCount = Math.max(movies.last_page ?? 1, tvShows.last_page ?? 1);

  const moviesTotal = movies.total ?? movies.data?.length ?? 0;
  const tvTotal = tvShows.total ?? tvShows.data?.length ?? 0;

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Titles" value={(moviesTotal + tvTotal).toLocaleString()} icon={<FilmIcon />} />
        <StatCard label="Movies" value={moviesTotal.toLocaleString()} icon={<ReelIcon />} />
        <StatCard label="TV Shows" value={tvTotal.toLocaleString()} icon={<TvIcon />} />
        <StatCard label="Genres" value={genreCount.toLocaleString()} icon={<TagIcon />} />
      </div>

      <ContentClient
        initialRows={initialRows}
        initialPageCount={initialPageCount}
        initialSearch={search ?? ''}
      />
    </div>
  );
}
