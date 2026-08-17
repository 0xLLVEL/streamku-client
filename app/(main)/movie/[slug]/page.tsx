import { fetchApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { HeroTrailer } from '@/components/ui/HeroTrailer';
import { DraggableList } from '@/components/ui/DraggableList';
import Link from 'next/link';

import { PosterCard } from '@/components/ui/PosterCard';

async function getMovie(slug: string) {
  const res = await fetchApi(`/movies/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getRecommendations(slug: string) {
  const res = await fetchApi(`/movies/${slug}/recommendations`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.data || [];
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovie(slug);
  const recommendations = await getRecommendations(slug);

  if (!movie) {
    notFound();
  }

  const tmdbBaseUrl = 'https://image.tmdb.org/t/p/original';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Cinematic Edge-to-Edge Header */}
      <div className="relative h-[95vh] w-full flex items-center justify-center">
        {/* Backdrop Image */}
        <HeroTrailer 
          backdropPath={movie.backdrop_path} 
          title={movie.title} 
          videos={movie.videos} 
        />

        {/* Content Container Aligned to Bottom */}
        <div className="relative z-30 w-full h-full flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-20">
          <div className="flex flex-row items-end justify-between w-full">
            
            {/* Left Side: Title, Metadata, Description */}
            <div className="flex-1 max-w-2xl">
              {/* Massive Cinematic Title */}
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400 mb-2 tracking-tighter drop-shadow-2xl">
                {movie.title}
              </h1>
              
              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-300 mb-6 drop-shadow-md">
                  {movie.genres.map((genre: any, idx: number) => (
                    <span key={genre.id} className="flex items-center">
                      <Link href={`/genres/${genre.slug}`} className="hover:text-white transition-colors cursor-pointer">
                        {genre.name}
                      </Link>
                      {idx < movie.genres.length - 1 && <span className="mx-2 text-gray-500">•</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                  Watchlist
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  Favourite
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                  Add to Collection
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass hover:bg-white/20 transition-colors text-sm font-bold text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  Trailer
                </button>
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-400 mb-6 drop-shadow-md">
                {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
                {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                <span className="px-2 py-0.5 border border-gray-500 rounded text-xs font-bold text-gray-300">HD</span>
                {movie.vote_average > 0 && (
                  <span className="flex items-center text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {parseFloat(movie.vote_average).toFixed(1)}
                  </span>
                )}
                {movie.original_language && <span className="uppercase">{movie.original_language}</span>}
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                  Share
                </button>
              </div>

              {/* Overview */}
              {movie.tagline && <p className="text-gray-400 italic mb-3 font-medium text-base">{movie.tagline}</p>}
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-2xl drop-shadow-sm font-medium line-clamp-4">
                {movie.overview}
              </p>
            </div>

            {/* Right Side: Poster Card */}
            <div className="w-64 shrink-0 hidden lg:block liquid-glass p-2 rounded-[2rem] rotate-[2deg] hover:rotate-0 transition-transform duration-500 shadow-2xl ml-8">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="w-full rounded-3xl shadow-inner"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Cast Section */}
      {(movie.cast && movie.cast.length > 0) && (
        <div className="w-full px-8 md:px-16 lg:px-24 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">Top Cast</h2>
          <DraggableList className="pb-4" innerClassName="space-x-6">
            {movie.cast.slice(0, 15).map((actor: any, index: number) => (
              <div key={index} className="snap-start flex-shrink-0 w-36 group">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden liquid-glass mb-3">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/30 text-sm pointer-events-none">No Image</div>
                  )}
                </div>
                <h3 className="text-white font-bold text-sm truncate drop-shadow-sm pointer-events-none">{actor.name}</h3>
                <p className="text-white/60 text-xs truncate pointer-events-none">{actor.character}</p>
              </div>
            ))}
          </DraggableList>
        </div>
      )}

    </div>
  );
}
