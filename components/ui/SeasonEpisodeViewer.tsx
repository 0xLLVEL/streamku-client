'use client';

import { useState } from 'react';

interface SeasonEpisodeViewerProps {
  seasons: any[];
}

export function SeasonEpisodeViewer({ seasons }: SeasonEpisodeViewerProps) {
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
        <EpisodeList episodes={season.episodes} />
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
        <EpisodeList episodes={season.episodes} />
      </div>
    );
  }

  // Otherwise, show the seasons grid
  return (
    <div className="w-full px-8 md:px-16 lg:px-24 pb-24">
      <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-md">Seasons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {seasons.map((season: any) => (
          <div 
            key={season.id} 
            onClick={() => setSelectedSeasonId(season.id)}
            className="liquid-glass rounded-2xl p-3 flex gap-4 hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="w-20 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/5">
              {season.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} 
                  alt={season.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full aspect-[2/3] bg-black/40 flex items-center justify-center text-[10px] text-white/30">No Poster</div>
              )}
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-red-500 transition-colors truncate">{season.name}</h3>
              <div className="flex items-center gap-2 text-xs text-white/60 mb-1.5 font-medium">
                {season.air_date && <span>{new Date(season.air_date).getFullYear()}</span>}
                <span>•</span>
                <span>{season.episode_count} Episodes</span>
              </div>
              {season.overview && (
                <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">{season.overview}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EpisodeList({ episodes }: { episodes: any[] }) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="flex flex-col liquid-glass rounded-2xl overflow-hidden">
        <div className="text-white/50 p-6 text-sm text-center">No episodes available.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col liquid-glass rounded-2xl overflow-hidden divide-y divide-white/5">
      {episodes.map((episode: any) => (
        <div key={episode.id} className="p-3 flex gap-4 hover:bg-white/5 transition-colors group cursor-pointer">
          <div className="w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-black/50 relative border border-white/5">
            {episode.still_path ? (
              <img src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} alt={episode.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/30">No Image</div>
            )}
            {episode.runtime > 0 && (
              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-white/90 font-bold backdrop-blur-sm">
                {episode.runtime}m
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">{episode.episode_number}. {episode.name}</h3>
              {episode.air_date && <span className="text-[11px] text-white/40 font-medium shrink-0">{new Date(episode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </div>
            {episode.overview && (
              <p className="text-white/50 text-xs line-clamp-2 leading-relaxed max-w-3xl">{episode.overview}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
