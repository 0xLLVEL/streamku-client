import { fetchApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { HeroTrailer } from '@/components/media/HeroTrailer';
import { DraggableList } from '@/components/media/DraggableList';
import { SeasonEpisodeViewer } from '@/components/media/SeasonEpisodeViewer';
import { PlayAction } from '@/components/media/PlayAction';
import Link from 'next/link';

import { PosterCard } from '@/components/media/PosterCard';
import { WatchlistButton } from '@/components/media/WatchlistButton';
import { FavoriteButton } from '@/components/media/FavoriteButton';
import { ReviewsSection } from '@/components/media/ReviewsSection';
import { CommentsSection } from '@/components/media/CommentsSection';
import { getFavoriteState, getWatchlistState } from '@/lib/user-state';
import { getReviewBucket, getCommentThreads } from '@/lib/title-social';
import { tmdbImageUrl } from '@/lib/config';
import { TvShow, MediaItem } from '@/types';

async function getTvShow(slug: string): Promise<TvShow | null> {
  const res = await fetchApi(`/tv-shows/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getRecommendations(slug: string): Promise<MediaItem[]> {
  const res = await fetchApi(`/tv-shows/${slug}/recommendations`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function TvShowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await getTvShow(slug);
  const recommendations = await getRecommendations(slug);

  if (!show) {
    notFound();
  }

  const watchlist = await getWatchlistState(show?.id);
  const favorite = await getFavoriteState(show?.id);

  const reviewBucket = await getReviewBucket('tv_show', show.id);
  const commentThreads = await getCommentThreads('tv_show', show.id);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Cinematic Edge-to-Edge Header */}
      <div className="relative h-[95vh] w-full flex items-center justify-center">
        {/* Backdrop Image */}
        <HeroTrailer
          backdropPath={show.backdrop_path ?? null}
          title={show.name ?? ''}
          trailerUrl={show.trailer_url}
        />



        {/* Content Container Aligned to Bottom */}
        <div className="relative z-30 w-full h-full flex flex-col justify-end px-4 md:px-12 lg:px-24 pb-10 md:pb-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-6 md:gap-0">

            {/* Left Side: Title, Metadata, Description */}
            <div className="flex-1 w-full max-w-2xl">
              {/* Massive Cinematic Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400 mb-2 tracking-tighter drop-shadow-2xl leading-tight">
                {show.name}
              </h1>

              {/* Genres */}
              {show.genres && show.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-300 mb-6 drop-shadow-md">
                  {show.genres?.map((genre, idx, arr) => (
                    <span key={genre.id} className="flex items-center">
                      <Link href={`/genres/${genre.slug}`} className="hover:text-white transition-colors cursor-pointer">
                        {genre.name}
                      </Link>
                      {idx < arr.length - 1 && <span className="mx-2 text-gray-500">•</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {(() => {
                  let continueEpisode = show.seasons?.[0]?.episodes?.[0];
                  let isContinue = false;

                  if (show.seasons) {
                    for (const s of show.seasons) {
                      if (s.episodes) {
                        for (const ep of s.episodes) {
                          if (ep.history && ep.history.progress_seconds > 0) {
                            if (!ep.history.completed) {
                              continueEpisode = ep;
                              isContinue = true;
                            } else {
                              // If completed, maybe they want to watch the next episode,
                              // but finding the next episode is complex here.
                              // So we just keep it simple.
                            }
                          }
                        }
                      }
                    }
                  }

                  if (!continueEpisode) return null;

                  return (
                    <PlayAction
                      mediaEndpoint={`/tv-shows/${show.slug}/seasons/${continueEpisode.season_number || 1}/episodes/${continueEpisode.episode_number}/media`}
                      title={`${show.name} - S${continueEpisode.season_number || 1} E${continueEpisode.episode_number}`}
                      poster={tmdbImageUrl(show.backdrop_path, 'w1280') ?? ''}
                      videos={continueEpisode.videos}
                      type="tv"
                      tmdbId={show.tmdb_id}
                      watchableId={continueEpisode.id}
                      seasonNumber={continueEpisode.season_number}
                      episodeNumber={continueEpisode.episode_number}
                      initialTime={isContinue && continueEpisode.history ? continueEpisode.history.progress_seconds : 0}
                      label={isContinue ? `Continue S${continueEpisode.season_number || 1} E${continueEpisode.episode_number}` : `Play S1 E1`}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    />
                  );
                })()}
                <WatchlistButton watchableId={show.id} watchableType="tv_show" watchable={watchlist} />
                <FavoriteButton favoritableId={show.id} favoritableType="tv_show" favorite={favorite} />
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-400 mb-6 drop-shadow-md">
                {show.first_air_date && <span>{new Date(show.first_air_date).getFullYear()}</span>}
                {(show.number_of_seasons ?? 0) > 0 && <span>{show.number_of_seasons} Seasons</span>}
                <span className="px-2 py-0.5 border border-gray-500 rounded text-xs font-bold text-gray-300">HD</span>
                {(show.vote_average ?? 0) > 0 && (
                  <span className="flex items-center text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {Number(show.vote_average ?? 0).toFixed(1)}
                  </span>
                )}
                {show.original_language && <span className="uppercase">{show.original_language}</span>}
              </div>

              {/* Overview */}
              {show.tagline && <p className="text-gray-400 italic mb-3 font-medium text-base">{show.tagline}</p>}
              <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-2xl drop-shadow-sm font-medium line-clamp-4">
                {show.overview}
              </p>
            </div>

            {/* Right Side: Poster Card */}
            <div className="w-64 shrink-0 hidden lg:block liquid-glass p-2 rounded-[2rem] rotate-[2deg] hover:rotate-0 transition-transform duration-500 shadow-2xl ml-8">
              <img
                src={tmdbImageUrl(show.poster_path, 'w342') ?? ''}
                alt={show.name}
                className="w-full rounded-3xl shadow-inner"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Cast Section */}
      {(show.cast && show.cast.length > 0) && (
        <div className="w-full px-4 md:px-12 lg:px-24 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">Top Cast</h2>
          <DraggableList className="pb-4" innerClassName="space-x-6">
            {show.cast.slice(0, 15).map((actor, index) => (
              <div key={index} className="snap-start flex-shrink-0 w-28 md:w-36 group">
                <div className="aspect-square rounded-full overflow-hidden liquid-glass mb-3 mx-auto w-24 md:w-32 border-2 border-white/10 shadow-lg">
                  {actor.profile_path ? (
                    <img
                      src={tmdbImageUrl(actor.profile_path, 'w185') ?? ''}
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/30 text-xs text-center p-2">No Image</div>
                  )}
                </div>
                <h3 className="text-white font-bold text-sm truncate drop-shadow-sm text-center px-1">{actor.name}</h3>
                <p className="text-white/50 text-xs truncate text-center px-1">{actor.character}</p>
              </div>
            ))}
          </DraggableList>
        </div>
      )}

      {/* Seasons Grid in Liquid Glass */}
      {/* Seasons or Episodes Section */}
      <SeasonEpisodeViewer seasons={show.seasons || []} showSlug={slug} />

      <ReviewsSection mediaType="tv_show" mediaId={show.id} slug={slug} initial={reviewBucket} />
      <CommentsSection mediaType="tv_show" mediaId={show.id} slug={slug} initial={commentThreads} />

      {/* More Like This */}
      {(recommendations && recommendations.length > 0) && (
        <div className="w-full px-4 md:px-12 lg:px-24 pb-24">
          <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-md">More Like This</h2>
          <DraggableList className="pb-4" innerClassName="space-x-3">
            {recommendations.map((item) => (
              <div key={item.id} className="snap-start shrink-0">
                <PosterCard item={item} />
              </div>
            ))}
          </DraggableList>
        </div>
      )}
    </div>
  );
}
