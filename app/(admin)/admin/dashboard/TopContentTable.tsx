import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config.utils';
import { AdminCard, EmptyState } from '@/components/admin/ui';
import { buttonVariants } from '@/components/ui/Button';
import type { TopTitleRow } from './analytics';

interface TopContentRow {
  key: string;
  title: string;
  kind: 'Movie' | 'Series';
  posterPath: string | null;
  views: number;
}

export function TopContentTable({ movies, episodes }: { movies: TopTitleRow[]; episodes: TopTitleRow[] }) {
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
