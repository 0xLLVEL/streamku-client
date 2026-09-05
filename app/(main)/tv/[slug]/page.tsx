import { fetchApi } from '@/lib/api.utils';
import { notFound } from 'next/navigation';
import { DetailHero, CastRow, MoreLikeThis } from '@/components/media/detail';
import { SeasonEpisodeViewer } from '@/components/media/SeasonEpisodeViewer';
import { WatchlistButton, FavoriteButton } from '@/components/media/ResourceToggleButton';
import { ReviewsSection } from '@/components/media/ReviewsSection';
import { CommentsSection } from '@/components/media/CommentsSection';
import { getFavoriteState, getWatchlistState } from '@/lib/user-state.utils';
import { tmdbImageUrl } from '@/lib/config.utils';
import { TvShow, MediaItem } from '@/types';
import { ContinuePlayButton } from './_components/ContinuePlayButton';
import { TvMeta } from './_components/TvMeta';

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
  const [show, recommendations] = await Promise.all([getTvShow(slug), getRecommendations(slug)]);

  if (!show) {
    notFound();
  }

  const [watchlist, favorite] = await Promise.all([
    getWatchlistState(show.id),
    getFavoriteState(show.id),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DetailHero
        title={show.name ?? ''}
        backdropPath={show.backdrop_path ?? null}
        trailerUrl={show.trailer_url}
        posterSrc={tmdbImageUrl(show.poster_path, 'w342') ?? ''}
        posterAlt={show.name ?? ''}
        genres={show.genres}
        tagline={show.tagline}
        overview={show.overview}
        actions={<><ContinuePlayButton show={show} /><WatchlistButton watchableId={show.id} watchableType="tv_show" watchable={watchlist} /><FavoriteButton favoritableId={show.id} favoritableType="tv_show" favorite={favorite} /></>}
        meta={<TvMeta firstAirDate={show.first_air_date} numberOfSeasons={show.number_of_seasons} voteAverage={show.vote_average} originalLanguage={show.original_language} />}
      />
      <CastRow cast={show.cast ?? []} />
      <SeasonEpisodeViewer seasons={show.seasons || []} showSlug={slug} />
      <ReviewsSection mediaType="tv_show" mediaId={show.id} slug={slug} />
      <CommentsSection mediaType="tv_show" mediaId={show.id} slug={slug} />
      <MoreLikeThis items={recommendations} />
    </div>
  );
}
