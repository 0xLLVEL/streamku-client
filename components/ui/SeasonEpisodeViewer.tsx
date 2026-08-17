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
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {seasons.map((season: any) => (
          <div 
            key={season.id} 
            onClick={() => setSelectedSeasonId(season.id)}
            className="liquid-glass rounded-2xl p-4 md:p-5 flex gap-5 md:gap-6 hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="w-24 md:w-32 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/5">
              {season.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} 
                  alt={season.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full aspect-[2/3] bg-black/40 flex items-center justify-center text-[10px] md:text-xs text-white/30">No Poster</div>
              )}
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors truncate">{season.name}</h3>
              <div className="flex items-center gap-2 text-sm text-white/60 mb-2 font-medium">
                {season.air_date && <span>{new Date(season.air_date).getFullYear()}</span>}
                <span>•</span>
                <span>{season.episode_count} Episodes</span>
              </div>
              {season.overview && (
                <p className="text-white/50 text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">{season.overview}</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8 pt-4">
      {episodes.map((episode: any) => (
        <div 
          key={episode.id} 
          className="liquid-glass rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="w-full aspect-video bg-black/50 relative border-b border-white/5">
            {episode.still_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} alt={episode.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs text-white/30">No Image</div>
            )}
            
            {/* Top Left Badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
              {episode.season_number ? `S${String(episode.season_number).padStart(2, '0')}` : ''}E{String(episode.episode_number).padStart(2, '0')}
            </div>

            {/* Top Right Badge (Date) */}
            {episode.air_date && (
              <div className="absolute top-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
                {new Date(episode.air_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
              </div>
            )}

            {/* Bottom Right Badge (Runtime) */}
            {episode.runtime > 0 && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
                {episode.runtime}m
              </div>
            )}
          </div>
          
          <div className="p-3 md:p-3.5 flex flex-col min-h-[85px] justify-center">
            <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 mb-1">
              Episode {episode.episode_number}: {episode.name}
            </h3>
            {episode.overview ? (
              <p className="text-white/50 text-[10px] md:text-[11px] line-clamp-2 leading-relaxed">{episode.overview}</p>
            ) : (
              <p className="text-white/30 text-[10px] md:text-[11px] italic">No description available.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
