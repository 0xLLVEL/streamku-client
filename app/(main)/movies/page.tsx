import { fetchApi } from '@/lib/api';
import { PosterCard } from '@/components/media/PosterCard';
import type { Movie } from '@/types';

async function getMovies(): Promise<Movie[]> {
  const res = await fetchApi('/movies', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <div className="pt-20 sm:pt-32 pb-20 px-4 sm:px-8 md:px-16 lg:px-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Movies</h1>
          <p className="text-white/50 mt-2 font-medium">Explore our entire collection of cinematic masterpieces.</p>
        </div>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <PosterCard key={movie.id} item={movie} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center liquid-glass rounded-3xl">
          <p className="text-white/50 text-lg">No movies found.</p>
        </div>
      )}
    </div>
  );
}
