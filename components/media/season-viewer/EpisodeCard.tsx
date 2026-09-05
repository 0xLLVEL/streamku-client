'use client';

import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MediaPlayer as VideoPlayer } from '@/components/player';
import { tmdbImageUrl } from '@/lib/config.utils';
import { useIsClient } from '@/hooks/use-is-client';
import type { Episode } from '@/types';
import { useEpisodePlayback } from './hooks/use-episode-playback';

export function EpisodeCard({ episode, showSlug }: { episode: Episode; showSlug: string }) {
  const { isOpen, setIsOpen, streamUrl, embedUrl, subtitleTracks, loading, handlePlayClick } = useEpisodePlayback(episode, showSlug);
  const isClient = useIsClient();

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
            <Image src={tmdbImageUrl(episode.still_path, 'w300') ?? ''} alt={episode.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
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
                style={{ width: `${(() => { const raw = episode.history.duration_seconds > 0 ? (episode.history.progress_seconds / episode.history.duration_seconds) * 100 : (episode.history.progress_seconds / 1440) * 100; return Math.min(100, Math.max(0, episode.history.progress_seconds > 0 ? Math.max(8, raw) : 0)); })()}%` }}
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
                subtitles={subtitleTracks}
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
