'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { API_BASE_URL, buildStreamUrl, buildVidKingEmbedUrl, tmdbImageUrl } from '@/lib/config';
import { resolveStreamableVideo } from '@/lib/media';
import { syncWatchProgress } from '@/lib/watchHistory';
import { useIsClient } from '@/hooks/useIsClient';

import { Season, Episode } from '@/types';

interface SeasonEpisodeViewerProps {
  seasons: Season[];
  showSlug: string;
}

export function SeasonEpisodeViewer({ seasons, showSlug }: SeasonEpisodeViewerProps) {
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-5">
        {seasons.map((season: Season) => (
          <div 
            key={season.id} 
            onClick={() => setSelectedSeasonId(season.id)}
            className="cursor-pointer group"
          >
            <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20 aspect-[2/3]">
              {season.poster_path ? (
                <img 
                  src={tmdbImageUrl(season.poster_path, 'w300') ?? ''} 
                  alt={season.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
    </div>
  );
}

function EpisodeList({ episodes, showSlug }: { episodes: Episode[], showSlug: string }) {
  if (!episodes || episodes.length === 0) {
    return <div className="text-white/50 text-sm">No episodes found.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {episodes.map((episode: Episode) => (
        <EpisodeCard key={episode.id} episode={episode} showSlug={showSlug} />
      ))}
    </div>
  );
}

function EpisodeCard({ episode, showSlug }: { episode: Episode, showSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen || !embedUrl || !episode.id) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const time = data.time || data.currentTime || data.progress;
        const dur = data.duration || data.totalTime;
        
        if (typeof time === 'number' && time > 0) {
          await syncWatchProgress({
            mediaType: 'episode',
            mediaId: episode.id,
            progressSeconds: time,
            durationSeconds: dur,
          });
        }
      } catch {
        // Ignore JSON parse errors for non-vidking messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, embedUrl, episode.id]);

  const handlePlayClick = async () => {
    if (streamUrl || embedUrl) {
      setIsOpen(true);
      return;
    }

    if (episode.videos && episode.videos.length > 0) {
      const extVideo = episode.videos[0];
      if (extVideo.site === 'VidKing') {
        setEmbedUrl(buildVidKingEmbedUrl(extVideo.key, 'tv', episode.season_number, episode.episode_number));
        setIsOpen(true);
        return;
      } else {
        setEmbedUrl(extVideo.key);
        setIsOpen(true);
        return;
      }
    }

    if (!showSlug) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tv-shows/${showSlug}/seasons/${episode.season_number}/episodes/${episode.episode_number}/media`);

      if (!res.ok) throw new Error('Failed to load media');

      const json = await res.json();
      const videoData = resolveStreamableVideo(json.data, 'Episode');

      if (videoData) {
        setStreamUrl(buildStreamUrl(videoData.id));
        setIsOpen(true);
      } else {
        alert('Video not available yet. Please upload it first.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        onClick={handlePlayClick}
        className="shadow-none rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-transform hover:-translate-y-1 relative bg-white/[0.02] hover:bg-white/[0.05]"
      >
        {loading && (
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <div className="w-full aspect-video bg-black/50 relative">
          {episode.still_path ? (
            <img src={tmdbImageUrl(episode.still_path, 'w300') ?? ''} alt={episode.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs text-white/30">No Image</div>
          )}
          
          <div className="absolute top-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
            {episode.season_number ? `S${String(episode.season_number).padStart(2, '0')}` : ''}E{String(episode.episode_number).padStart(2, '0')}
          </div>

          {episode.air_date && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
              {new Date(episode.air_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
            </div>
          )}

          {(episode.runtime ?? 0) > 0 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-white/90 font-bold backdrop-blur-md">
              {episode.runtime}m
            </div>
          )}

          {/* Progress Bar */}
          {episode.history && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                style={{ width: `${Math.min(100, Math.max(0, episode.history.duration_seconds > 0 ? (episode.history.progress_seconds / episode.history.duration_seconds) * 100 : 0))}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="p-2.5 flex flex-col justify-center">
          <h3 className="text-[11px] md:text-xs font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 mb-1">
            {episode.episode_number}. {episode.name}
          </h3>
          {episode.overview ? (
            <p className="text-white/40 text-[9px] md:text-[10px] line-clamp-2 leading-relaxed">{episode.overview}</p>
          ) : (
            <p className="text-white/30 text-[9px] md:text-[10px] italic">No description available.</p>
          )}
        </div>
      </div>

      {isClient && isOpen && (streamUrl || embedUrl) && createPortal(
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
           {streamUrl ? (
             <VideoPlayer 
               src={streamUrl} 
               title={`Episode ${episode.episode_number}: ${episode.name}`}
               poster={tmdbImageUrl(episode.still_path, 'w1280') ?? ''} 
               onBack={() => setIsOpen(false)} 
               watchableId={episode.id}
               watchableType="episode"
               initialTime={episode.history ? episode.history.progress_seconds : 0}
             />
           ) : embedUrl ? (
             <div className="w-full h-full relative flex flex-col bg-black">
               <button 
                 onClick={() => setIsOpen(false)}
                 className="absolute top-6 left-6 z-50 p-3 bg-black/50 hover:bg-red-600 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
               </button>
               <iframe 
                 src={embedUrl} 
                 className="w-full h-full border-none outline-none bg-black"
                 allowFullScreen
               ></iframe>
             </div>
           ) : null}
        </div>,
        document.body
      )}
    </>
  );
}
