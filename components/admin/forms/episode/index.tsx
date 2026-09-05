'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VideoCreateForm } from '../VideoCreateForm';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/admin/ui';
import { EpisodeMetaForm } from './EpisodeMetaForm';
import { EpisodeMediaList } from './EpisodeMediaList';
import { EpisodeEmbedList } from './EpisodeEmbedList';
import type { EpisodeEditData, EpisodeFormMessage } from './types';

export function EpisodeEditForm({ tvShowId, seasonNumber, episode }: { tvShowId: number | string, seasonNumber: number | string, episode: EpisodeEditData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<EpisodeFormMessage | null>(null);
  const existingVideoQualityIds =
    episode.media
      ?.filter((entry) => entry.type === 'video' && entry.quality?.id)
      .map((entry) => Number(entry.quality?.id)) ?? [];
  const hasVideos =
    (episode.media?.filter((entry) => entry.type === 'video').length ?? 0) > 0 ||
    (episode.videos?.length ?? 0) > 0;

  return (
    <div className="flex flex-col h-[100vh] -m-4 sm:-m-6 lg:-m-8 overflow-hidden relative">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href={`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`} aria-label="Go back" className="text-white/40 hover:text-white transition-colors duration-200 cursor-pointer focus-ring rounded-md shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-lg sm:text-2xl font-medium text-white tracking-tight truncate">Edit Episode {episode.episode_number}: &ldquo;{episode.name}&rdquo;</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {message && (
            <span className={`hidden sm:inline text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <Button type="submit" form="episode-form" variant="brand" size="sm" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent">
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="motion-safe:animate-in fade-in duration-300">
            <EpisodeMetaForm tvShowId={tvShowId} seasonNumber={seasonNumber} episode={episode} setIsSaving={setIsSaving} setMessage={setMessage} />
          </section>

          <hr className="border-white/5" />

          <section className="motion-safe:animate-in fade-in duration-300">
            <SectionCard title="Uploaded Videos" description="Files and embeds attached to this episode">
              {hasVideos ? (
                <div className="flex flex-col gap-3 mb-8">
                  <EpisodeMediaList media={episode.media} stillPath={episode.still_path} setMessage={setMessage} />
                  <EpisodeEmbedList tvShowId={tvShowId} seasonNumber={seasonNumber} episodeNumber={episode.episode_number} videos={episode.videos} setMessage={setMessage} />
                </div>
              ) : (
                <p className="text-sm text-white/50 mb-8">No streams available.</p>
              )}
            </SectionCard>

            <SectionCard title="Upload New Video" className="mt-8">
              <VideoCreateForm
                mediableType="episode"
                mediableId={episode.episode_number}
                tvShowId={tvShowId}
                seasonNumber={seasonNumber}
                parentTitle={episode.name ?? ''}
                inline={true}
                existingVideoQualityIds={existingVideoQualityIds}
                parentTmdbId={episode.season?.tv_show?.tmdb_id ? `${episode.season.tv_show.tmdb_id}/${seasonNumber}/${episode.episode_number}` : undefined}
              />
            </SectionCard>
          </section>

        </div>
      </div>
    </div>
  );
}
