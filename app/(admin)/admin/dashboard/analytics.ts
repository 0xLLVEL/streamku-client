import { fetchApi } from '@/lib/api.utils';
import type { EngagementPoint } from '../EngagementChart';

export interface AnalyticsOverview {
  total_users: number;
  total_movies: number;
  total_tv_shows: number;
  total_watch_hours: number;
  top_countries?: { country: string; views: number }[] | null;
}

export interface TopTitleRow {
  watchable_id: number;
  views: number;
  watchable?: {
    title?: string | null;
    poster_path?: string | null;
    season?: { tvShow?: { name?: string | null; poster_path?: string | null } | null } | null;
  } | null;
}

export interface AdminAnalytics {
  overview: AnalyticsOverview | null;
  topTitles: { top_movies: TopTitleRow[]; top_episodes: TopTitleRow[] } | null;
  engagement: { chart_data: EngagementPoint[] } | null;
}

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export function formatCount(value: number): string {
  return value >= 100_000 ? compactFormatter.format(value) : value.toLocaleString();
}

export async function getAnalytics(): Promise<AdminAnalytics> {
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
