'use client';

import { useRouter } from 'next/navigation';
import { deleteEmbedVideoAction } from '@/app/actions/admin-content-embeds';
import type { EpisodeEmbedVideo, EpisodeFormMessage } from './types';

interface EpisodeEmbedListProps {
  tvShowId: number | string;
  seasonNumber: number | string;
  episodeNumber: number;
  videos: EpisodeEmbedVideo[] | undefined;
  setMessage: (msg: EpisodeFormMessage | null) => void;
}

export function EpisodeEmbedList({ tvShowId, seasonNumber, episodeNumber, videos, setMessage }: EpisodeEmbedListProps) {
  const router = useRouter();

  const handleDeleteEmbedVideo = async (e: React.MouseEvent, videoId: string | number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this stream?')) return;

    const res = await deleteEmbedVideoAction({
      tvShowId,
      seasonNumber,
      mediableId: episodeNumber,
      mediableType: 'episode',
      videoId,
    });

    if (res.success) {
      setMessage({ text: 'Stream deleted successfully', type: 'success' });
      router.refresh();
    } else {
      setMessage({ text: res.error || 'Failed to delete stream', type: 'error' });
    }
  };

  return (
    <>
      {videos?.map((video) => (
        <div key={`ext-video-${video.id}`} className="bg-white/5 border border-white/10 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-white/10 transition-colors duration-200 group">
          <div className="w-full sm:w-48 aspect-video bg-black/30 border border-white/10 rounded-md overflow-hidden relative flex-shrink-0 flex items-center justify-center">
            <span className="text-sm font-bold text-red-400 bg-red-600/10 px-3 py-1 rounded-md">{video.site}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <p className="text-base text-red-500 font-bold truncate group-hover:text-red-400 transition-colors" title={video.name ?? undefined}>
              {video.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-white/30 mt-1">
                ID: {video.key}
              </span>
            </div>
          </div>

          <div className="flex items-center pr-4 gap-6">
            <button
              type="button"
              onClick={(e) => handleDeleteEmbedVideo(e, video.id)}
              className="text-white/30 hover:text-red-400 hover:bg-white/5 p-2 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:text-red-400"
              title="Delete Stream"
              aria-label={`Delete stream ${video.name ?? video.key}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
