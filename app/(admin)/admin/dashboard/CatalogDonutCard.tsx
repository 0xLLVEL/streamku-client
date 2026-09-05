import { AdminCard } from '@/components/admin/ui';

export function CatalogDonutCard({ movies, tvShows }: { movies: number; tvShows: number }) {
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
