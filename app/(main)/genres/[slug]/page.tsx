import { fetchApi } from '@/lib/api';
import { PosterCard } from '@/components/media/PosterCard';
import { notFound } from 'next/navigation';
import type { MediaItem } from '@/types';

interface GenreDetails {
  genre: { name: string };
  movies: MediaItem[];
  tv_shows: MediaItem[];
}

async function getGenreDetails(slug: string): Promise<GenreDetails | null> {
  const res = await fetchApi(`/genres/${slug}`, { next: { revalidate: 0 } });
  if (!res.ok) {
    return null;
  }
  const json = await res.json();
  return json.data;
}

export default async function GenreDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getGenreDetails(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { genre, movies, tv_shows } = data;
  const hasMovies = movies && movies.length > 0;
  const hasTvShows = tv_shows && tv_shows.length > 0;

  return (
    <div className="pt-20 sm:pt-32 pb-20 px-4 sm:px-8 md:px-16 lg:px-24 min-h-screen">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-md">{genre.name}</h1>
        <p className="text-white/50 mt-3 text-lg font-medium">
          Browse all the best movies and TV shows in {genre.name}.
        </p>
      </div>

      {!hasMovies && !hasTvShows && (
        <div className="p-12 text-center liquid-glass rounded-3xl">
          <p className="text-white/50 text-lg">No content found for this genre.</p>
        </div>
      )}

      {hasMovies && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-white/20 pl-4">Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <PosterCard key={movie.id} item={movie} />
            ))}
          </div>
        </div>
      )}

      {hasTvShows && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-white/20 pl-4">TV Series</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {tv_shows.map((show) => (
              <PosterCard key={show.id} item={show} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
