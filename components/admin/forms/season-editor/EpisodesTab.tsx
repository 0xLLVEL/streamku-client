'use client';

import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config.utils';
import { BulkGenerateBar } from './BulkGenerateBar';
import { useBulkGenerate } from './hooks/use-bulk-generate';
import type { SeasonEditData } from './types';

interface EpisodesTabProps {
  tvShowId: number | string;
  season: SeasonEditData;
}

export function EpisodesTab({ tvShowId, season }: EpisodesTabProps) {
  const bulk = useBulkGenerate(tvShowId, season.season_number, season.episodes?.length?.toString() || '10');
  return (
    <div className="max-w-6xl motion-safe:animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-white">Episodes ({season.episodes?.length || 0})</h2>
        <BulkGenerateBar
          totalEpisodes={bulk.totalEpisodes}
          onTotalChange={bulk.setTotalEpisodes}
          bulkSite={bulk.bulkSite}
          onSiteChange={bulk.setBulkSite}
          isGenerating={bulk.isGenerating}
          generateMessage={bulk.generateMessage}
          onGenerate={(e) => void bulk.handleBulkGenerate(e)}
        />
      </div>
      <div className="flex flex-col rounded-xl border border-white/10 bg-black/30 divide-y divide-white/5">
        {season.episodes?.map((episode) => (
          <div key={episode.id} className="flex items-center gap-3 sm:gap-6 py-3 sm:py-5 px-4 sm:px-6 hover:bg-white/[0.03] transition-colors group">
            <div className="w-24 sm:w-36 md:w-48 shrink-0 bg-[#1e1e24] relative aspect-video rounded-md overflow-hidden shadow-md border border-white/10">
              {episode.still_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tmdbImageUrl(episode.still_path, 'w300') ?? undefined} className="w-full h-full object-cover" alt={episode.name ?? undefined} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Photo</div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-white truncate" title={episode.name ?? undefined}>
                  <span className="text-white/40 mr-3 font-mono text-sm">S{season.season_number} E{episode.episode_number}</span>
                  {episode.name}
                </p>
                <p className="text-white/50 text-sm mt-1.5 line-clamp-2">{episode.overview || 'No overview available.'}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm text-white/40 shrink-0 font-medium">
                {episode.air_date && <span>{episode.air_date.split('T')[0]}</span>}
                {(episode.runtime ?? 0) > 0 && <span className="text-xs text-white/30">{episode.runtime ?? 0} min</span>}
              </div>
            </div>
            <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 sm:group-focus-within:opacity-100 pl-4 transition-opacity duration-200 flex items-center gap-2">
              <Link href={`/admin/tv-shows/${tvShowId}/seasons/${season.season_number}/episodes/${episode.episode_number}`} aria-label={`Edit episode ${episode.episode_number}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors duration-200 shadow-sm cursor-pointer focus-ring" title="Edit Episode">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </Link>
            </div>
          </div>
        ))}
        {(!season.episodes || season.episodes.length === 0) && (
          <div className="p-8 text-center text-white/50 text-sm">No episodes available.</div>
        )}
      </div>
    </div>
  );
}
