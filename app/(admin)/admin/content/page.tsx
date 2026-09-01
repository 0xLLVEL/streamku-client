import { fetchApi, fetchAdminPage } from '@/lib/api';
import { StatCard } from '@/components/admin/ui';
import { ContentClient, type ContentRow } from './ContentClient';

interface MovieApiRow {
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres?: { name: string }[] | null;
  created_at: string;
}

interface TvApiRow {
  id: number;
  tmdb_id: number | null;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
  views: number;
  genres?: { name: string }[] | null;
  created_at: string;
}

function normalizeMovie(row: MovieApiRow): ContentRow {
  return {
    kind: 'movie',
    id: row.id,
    tmdb_id: row.tmdb_id,
    title: row.title,
    poster_path: row.poster_path,
    release_date: row.release_date,
    views: row.views,
    genres: row.genres ?? null,
    created_at: row.created_at,
  };
}

function normalizeTv(row: TvApiRow): ContentRow {
  return {
    kind: 'tv',
    id: row.id,
    tmdb_id: row.tmdb_id,
    title: row.name,
    poster_path: row.poster_path,
    release_date: row.first_air_date,
    views: row.views,
    genres: row.genres ?? null,
    created_at: row.created_at,
  };
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
    ...(movies.data ?? []).map(normalizeMovie),
    ...(tvShows.data ?? []).map(normalizeTv),
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

function FilmIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function ReelIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}
