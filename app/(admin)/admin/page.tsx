import { AdminCard, AdminPageHeader, EmptyState, StatCard } from '@/components/admin/ui';
import { buttonVariants } from '@/components/ui/Button';
import { PlaysChartCard } from './EngagementChart';
import { formatCount, getAnalytics } from './dashboard/analytics';
import { CatalogDonutCard } from './dashboard/CatalogDonutCard';
import { TopContentTable } from './dashboard/TopContentTable';
import { ClockIcon, ReelIcon, TvIcon, UsersIcon } from './dashboard/icons';

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
