import { fetchApi } from '@/lib/api';
import { PosterCard } from '@/components/media/PosterCard';
import type { TvShow } from '@/types';

async function getTvShows(): Promise<TvShow[]> {
  const res = await fetchApi('/tv-shows', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function TvShowsPage() {
  const shows = await getTvShows();

  return (
    <div className="pt-20 sm:pt-32 pb-20 px-4 sm:px-8 md:px-16 lg:px-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">TV Series</h1>
          <p className="text-white/50 mt-2 font-medium">Binge-worthy shows to keep you entertained all weekend.</p>
        </div>
      </div>

      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {shows.map((show) => (
            <PosterCard key={show.id} item={show} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center liquid-glass rounded-3xl">
          <p className="text-white/50 text-lg">No TV shows found.</p>
        </div>
      )}
    </div>
  );
}
