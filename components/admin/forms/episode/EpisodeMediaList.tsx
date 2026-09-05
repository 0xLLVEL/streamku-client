'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMediaAction } from '@/app/actions/admin-content-embeds';
import { buildStreamUrl, tmdbImageUrl } from '@/lib/config.utils';
import type { EpisodeFormMessage, EpisodeMediaEntry } from './types';

interface EpisodeMediaListProps {
  media: EpisodeMediaEntry[] | undefined;
  stillPath: string | null | undefined;
  setMessage: (msg: EpisodeFormMessage | null) => void;
}

export function EpisodeMediaList({ media, stillPath, setMessage }: EpisodeMediaListProps) {
  const router = useRouter();
  const [activeVideo, setActiveVideo] = useState<EpisodeMediaEntry | null>(null);

  const handleDeleteVideo = async (e: React.MouseEvent, mediaId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) return;

    const res = await deleteMediaAction(mediaId);
    if (res.success) {
      setMessage({ text: 'Video deleted successfully', type: 'success' });
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete video');
    }
  };

  return (
    <>
      {media?.filter((entry) => entry.type === 'video').map((video) => (
        <div key={video.id} onClick={() => setActiveVideo(video)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setActiveVideo(video); }} className="bg-white/5 border border-white/10 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-white/10 transition-colors duration-200 cursor-pointer group focus-ring">
          <div className="w-full sm:w-48 aspect-video bg-black/30 border border-white/10 rounded-md overflow-hidden relative flex-shrink-0">
            {stillPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tmdbImageUrl(stillPath, 'w300') ?? undefined} alt="Thumbnail" className="w-full h-full object-cover pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
            ) : (
              <video src={buildStreamUrl(video.id)} className="w-full h-full object-contain pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg border border-white/20 group-hover:border-red-500 group-hover:scale-110">
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <p className="text-base text-red-500 font-bold truncate group-hover:text-red-400 transition-colors" title={(video.metadata?.label || video.original_filename) ?? undefined}>
              {video.metadata?.label || video.original_filename}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-white/60 font-medium">{video.quality?.name}</span>
              <span className="text-xs text-white/30 mt-1">
                Uploaded {video.created_at ? new Date(video.created_at).toLocaleDateString('en-CA') : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center pr-4 gap-6">
            <button
              type="button"
              onClick={(e) => handleDeleteVideo(e, video.id)}
              className="text-white/30 hover:text-red-400 hover:bg-white/5 p-2 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:text-red-400"
              title="Delete Video"
              aria-label="Delete video"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      ))}

      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10 motion-safe:animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close player"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors duration-200 backdrop-blur-sm shadow-md cursor-pointer focus-ring"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <video
              src={buildStreamUrl(activeVideo.id)}
              className="w-full h-full"
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </>
  );
}
