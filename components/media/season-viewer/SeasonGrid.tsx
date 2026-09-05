'use client';

import { useState } from 'react';
import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { Season } from '@/types';
import { EpisodeList } from './EpisodeList';

export function SeasonEpisodeViewer({ seasons, showSlug }: { seasons: Season[]; showSlug: string }) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  if (!seasons || seasons.length === 0) {
    return null;
  }

  // If only 1 season, just show its episodes directly
  if (seasons.length === 1) {
    const season = seasons[0];
    return (
      <div className="w-full px-8 md:px-16 lg:px-24 pb-24">
        <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-md">Episodes</h2>
        <EpisodeList episodes={season.episodes || []} showSlug={showSlug} />
      </div>
    );
  }

  // If a season is selected, show its episodes and a back button
  if (selectedSeasonId !== null) {
    const season = seasons.find(s => s.id === selectedSeasonId);
    if (!season) return null;

    return (
      <div className="w-full px-8 md:px-16 lg:px-24 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedSeasonId(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full liquid-glass hover:bg-white/20 transition-colors text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">{season.name}</h2>
            <p className="text-sm text-white/50 mt-1 font-medium">{season.episode_count} Episodes</p>
          </div>
        </div>
        <EpisodeList episodes={season.episodes || []} showSlug={showSlug} />
      </div>
    );
  }

  // Otherwise, show the seasons grid
  return (
    <div className="w-full px-8 md:px-16 lg:px-24 pb-24">
      <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-md">Seasons</h2>
      <SeasonGrid seasons={seasons} onSelect={setSelectedSeasonId} />
    </div>
  );
}

export function SeasonGrid({ seasons, onSelect }: { seasons: Season[]; onSelect: (id: number) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-5">
      {seasons.map((season: Season) => (
        <div
          key={season.id}
          onClick={() => onSelect(season.id)}
          className="cursor-pointer group"
        >
          <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20 aspect-[2/3] relative">
            {season.poster_path ? (
              <Image
                src={tmdbImageUrl(season.poster_path, 'w300') ?? ''}
                alt={season.name}
                fill
                sizes="220px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] md:text-xs text-white/30">No Poster</div>
            )}
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate">{season.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
