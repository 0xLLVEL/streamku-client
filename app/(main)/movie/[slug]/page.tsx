import { fetchApi } from '@/lib/api.utils';
import { notFound } from 'next/navigation';
import { DetailHero, CastRow, MoreLikeThis, BackdropsRow } from '@/components/media/detail';
import { PlayAction } from '@/components/media/PlayAction';
import { WatchlistButton, FavoriteButton } from '@/components/media/ResourceToggleButton';
import { ReviewsSection } from '@/components/media/ReviewsSection';
import { CommentsSection } from '@/components/media/CommentsSection';
import { getFavoriteState, getWatchlistState } from '@/lib/user-state.utils';
import { artworkUrl, tmdbImageUrl } from '@/lib/config.utils';
import { Movie, MediaItem } from '@/types';
import { MovieMeta } from './_components/MovieMeta';

async function getMovie(slug: string): Promise<Movie | null> {
  const res = await fetchApi(`/movies/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getRecommendations(slug: string): Promise<MediaItem[]> {
  const res = await fetchApi(`/movies/${slug}/recommendations`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [movie, recommendations] = await Promise.all([getMovie(slug), getRecommendations(slug)]);

  if (!movie) {
    notFound();
  }

  const [watchlist, favorite] = await Promise.all([
    getWatchlistState(movie.id),
    getFavoriteState(movie.id),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DetailHero
        title={movie.title ?? ''}
        backdropPath={movie.backdrop_path ?? null}
        trailerUrl={movie.trailer_url}
        posterSrc={artworkUrl(movie.poster_path, 'w342') ?? tmdbImageUrl(movie.poster_path, 'w342') ?? ''}
        posterAlt={movie.title ?? ''}
        genres={movie.genres}
        tagline={movie.tagline}
        overview={movie.overview}
        actions={<><PlayAction mediaEndpoint={`/movies/${movie.slug}/media`} title={movie.title ?? ''} poster={tmdbImageUrl(movie.poster_path, 'w1280') ?? ''} videos={movie.videos} type="movie" tmdbId={movie.tmdb_id} watchableId={movie.id} initialTime={movie.history ? movie.history.progress_seconds : 0} label={movie.history ? 'Continue' : 'Play Movie'} className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]" /><WatchlistButton watchableId={movie.id} watchableType="movie" watchable={watchlist} /><FavoriteButton favoritableId={movie.id} favoritableType="movie" favorite={favorite} /></>}
        meta={<MovieMeta releaseDate={movie.release_date} runtime={movie.runtime} voteAverage={movie.vote_average} originalLanguage={movie.original_language} />}
      />
      <BackdropsRow backdropPath={movie.backdrop_path} backdrops={movie.images?.backdrops} />
      <CastRow cast={movie.cast ?? []} />
      <ReviewsSection mediaType="movie" mediaId={movie.id} slug={slug} />
      <CommentsSection mediaType="movie" mediaId={movie.id} slug={slug} />
      <MoreLikeThis items={recommendations} />
    </div>
  );
}
