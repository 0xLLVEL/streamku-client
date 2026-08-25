import { fetchApi } from '@/lib/api';
import { tmdbImageUrl } from '@/lib/config';
import Link from 'next/link';
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from '@/components/admin/ui';
import { buttonVariants } from '@/components/ui/Button';
import { PlaysChartCard, type EngagementPoint } from './EngagementChart';

interface AnalyticsOverview {
  total_users: number;
  total_movies: number;
  total_tv_shows: number;
  total_watch_hours: number;
  top_countries?: { country: string; views: number }[] | null;
}

interface TopTitleRow {
  watchable_id: number;
  views: number;
  watchable?: {
    title?: string | null;
    poster_path?: string | null;
    season?: { tvShow?: { name?: string | null; poster_path?: string | null } | null } | null;
  } | null;
}

interface AdminAnalytics {
  overview: AnalyticsOverview | null;
  topTitles: { top_movies: TopTitleRow[]; top_episodes: TopTitleRow[] } | null;
  engagement: { chart_data: EngagementPoint[] } | null;
}

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function formatCount(value: number): string {
  return value >= 100_000 ? compactFormatter.format(value) : value.toLocaleString();
}

async function getAnalytics(): Promise<AdminAnalytics> {
  const [overviewRes, topTitlesRes, engagementRes] = await Promise.all([
    fetchApi('/admin/analytics/overview', { next: { revalidate: 0 } }),
    fetchApi('/admin/analytics/top-titles', { next: { revalidate: 0 } }),
    fetchApi('/admin/analytics/engagement', { next: { revalidate: 0 } })
  ]);

  const overview = overviewRes.ok ? (await overviewRes.json()).data : null;
  const topTitles = topTitlesRes.ok ? (await topTitlesRes.json()).data : null;
  const engagement = engagementRes.ok ? (await engagementRes.json()).data : null;

  return { overview, topTitles, engagement };
}

export default async function AdminDashboardPage() {
  const data = await getAnalytics();

  if (!data.overview || !data.topTitles || !data.engagement) {
    return (
      <AdminCard className="mt-8">
        <EmptyState
          title="Failed to load analytics"
          description="The analytics service could not be reached. Check the API connection and try again."
          action={
            <a href="/admin" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Retry
            </a>
          }
        />
      </AdminCard>
    );
  }

  const { total_users, total_movies, total_tv_shows, total_watch_hours } = data.overview;

  return (
    <div className="motion-safe:animate-in fade-in duration-500 text-[#F8FAFC] font-sans">

      <AdminPageHeader title="Plays report" description="Catalog performance and playback activity" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Users" value={formatCount(total_users)} caption="registered accounts" icon={<UsersIcon />} />
        <StatCard label="Movies" value={formatCount(total_movies)} caption="in catalog" icon={<ReelIcon />} />
        <StatCard label="TV Shows" value={formatCount(total_tv_shows)} caption="in catalog" icon={<TvIcon />} />
        <StatCard label="Watch Hours" value={formatCount(total_watch_hours)} caption="hours streamed" icon={<ClockIcon />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <PlaysChartCard data={data.engagement.chart_data} />
        <CatalogDonutCard movies={total_movies} tvShows={total_tv_shows} />
      </div>

      {/* Top Content */}
      <TopContentTable movies={data.topTitles.top_movies} episodes={data.topTitles.top_episodes} />

    </div>
  );
}

/* ------------------------------ Catalog donut ------------------------------ */

function CatalogDonutCard({ movies, tvShows }: { movies: number; tvShows: number }) {
  const total = movies + tvShows;
  const moviesFraction = total > 0 ? movies / total : 0;

  const R = 70;
  const C = 2 * Math.PI * R;
  const GAP = total > 0 ? 6 : 0;
  const moviesLen = Math.max(moviesFraction * C - GAP, 0);
  const tvLen = Math.max((1 - moviesFraction) * C - GAP, 0);

  return (
    <AdminCard className="p-6 flex flex-col">
      <div>
        <h3 className="text-white font-semibold text-sm">Catalog split</h3>
        <p className="text-xs text-white/40 mt-0.5">Movies vs TV shows</p>
      </div>

      <div className="flex-1 flex items-center justify-center py-6">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" role="img" aria-label={`Catalog: ${movies} movies, ${tvShows} TV shows`}>
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
            {movies > 0 && (
              <circle
                cx="100" cy="100" r={R} fill="none"
                stroke="#DC2626" strokeWidth="18" strokeLinecap="round"
                strokeDasharray={`${moviesLen} ${C - moviesLen}`}
              />
            )}
            {tvShows > 0 && (
              <circle
                cx="100" cy="100" r={R} fill="none"
                stroke="rgba(255,255,255,0.25)" strokeWidth="18" strokeLinecap="round"
                strokeDasharray={`${tvLen} ${C - tvLen}`}
                strokeDashoffset={-(moviesLen + GAP)}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-white tabular-nums">{total.toLocaleString()}</p>
            <p className="text-[11px] text-white/40 mt-0.5">titles</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-2 text-white/70">
            <span className="w-2 h-2 rounded-full bg-red-600" aria-hidden />
            Movies
          </span>
          <span className="font-semibold text-white tabular-nums">{movies.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-2 text-white/70">
            <span className="w-2 h-2 rounded-full bg-white/25" aria-hidden />
            TV Shows
          </span>
          <span className="font-semibold text-white tabular-nums">{tvShows.toLocaleString()}</span>
        </div>
      </div>
    </AdminCard>
  );
}

/* ------------------------------ Top content table ------------------------------ */

interface TopContentRow {
  key: string;
  title: string;
  kind: 'Movie' | 'Series';
  posterPath: string | null;
  views: number;
}

function TopContentTable({ movies, episodes }: { movies: TopTitleRow[]; episodes: TopTitleRow[] }) {
  const rows: TopContentRow[] = [
    ...(movies ?? []).map((row, idx) => ({
      key: `movie-${row.watchable_id}-${idx}`,
      title: row.watchable?.title || 'Unknown Movie',
      kind: 'Movie' as const,
      posterPath: row.watchable?.poster_path ?? null,
      views: row.views,
    })),
    ...(episodes ?? []).map((row, idx) => ({
      key: `episode-${row.watchable_id}-${idx}`,
      title: row.watchable?.season?.tvShow?.name || 'Unknown Show',
      kind: 'Series' as const,
      posterPath: row.watchable?.season?.tvShow?.poster_path ?? null,
      views: row.views,
    })),
  ]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const maxViews = Math.max(1, ...rows.map((row) => row.views));

  return (
    <AdminCard className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Top titles</h3>
          <p className="text-xs text-white/40 mt-0.5">Most played titles across the catalog</p>
        </div>
        <Link href="/admin/content" className={buttonVariants({ variant: 'outline', size: 'xs' })}>
          View all
        </Link>
      </div>

      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
                <th scope="col" className="py-2.5 pr-4 font-semibold w-12">#</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">Title</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold text-right">Views</th>
                <th scope="col" className="py-2.5 font-semibold w-40 hidden md:table-cell">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => (
                <tr key={row.key} className="group">
                  <td className="py-3 pr-4">
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                      idx < 3
                        ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                        : 'text-white/40'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-11 rounded-md bg-[#1E1E2D] overflow-hidden shrink-0 border border-white/10">
                        {tmdbImageUrl(row.posterPath, 'w92') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tmdbImageUrl(row.posterPath, 'w92') ?? undefined} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-white/20">N/A</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate max-w-[220px]">{row.title}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{row.kind}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-[13px] font-semibold text-white tabular-nums">{row.views.toLocaleString()}</span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden" aria-hidden>
                        <div
                          className="h-full rounded-full bg-red-600"
                          style={{ width: `${Math.max((row.views / maxViews) * 100, 2)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-white/40 tabular-nums w-9 text-right">
                        {Math.round((row.views / maxViews) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No plays in this timeframe" />
      )}
    </AdminCard>
  );
}

/* ------------------------------ Icons ------------------------------ */

function UsersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ReelIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
