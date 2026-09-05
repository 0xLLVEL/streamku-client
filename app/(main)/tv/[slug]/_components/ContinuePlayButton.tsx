import { PlayAction } from '@/components/media/PlayAction';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { TvShow } from '@/types';

export function ContinuePlayButton({ show }: { show: TvShow }) {
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
}
