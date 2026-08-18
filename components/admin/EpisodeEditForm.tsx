'use client';

import { useState } from 'react';
import { updateEpisodeAction, deleteMediaAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VideoCreateForm } from './VideoCreateForm';

export function EpisodeEditForm({ tvShowId, seasonNumber, episode }: { tvShowId: number | string, seasonNumber: number | string, episode: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateEpisodeAction(tvShowId, seasonNumber, episode.episode_number, formData);
    setIsSaving(false);

    if (res.success) {
      setMessage({ text: 'Episode updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      router.refresh();
    } else {
      setMessage({ text: res.error || 'Failed to update episode', type: 'error' });
    }
  };

  const handleDeleteVideo = async (e: React.MouseEvent, mediaId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    const res = await deleteMediaAction(mediaId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete video');
    }
  };

  return (
    <div className="flex flex-col h-[100vh] -m-6 md:-m-8">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href={`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">Edit Episode {episode.episode_number}: &ldquo;{episode.name}&rdquo;</h1>
        </div>

        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button type="submit" form="episode-form" disabled={isSaving} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-medium text-sm transition-all disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-transparent">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* OVERVIEW SECTION */}
          <section className="animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-white mb-6">Episode Details</h2>
            <form id="episode-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">Still Image</label>
                  <div className="aspect-video bg-white/5 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm">
                    {episode.still_path ? (
                      <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} alt="Still" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-sm">No Photo</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Name</label>
                    <input type="text" name="name" defaultValue={episode.name} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-2">Air Date</label>
                      <input type="date" name="air_date" defaultValue={episode.air_date ? episode.air_date.split('T')[0] : ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all shadow-sm [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-2">Runtime (minutes)</label>
                      <input type="number" name="runtime" defaultValue={episode.runtime || ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Overview</label>
                    <textarea name="overview" defaultValue={episode.overview} rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all resize-y shadow-sm" />
                  </div>
                </div>
              </div>
            </form>
          </section>

          <hr className="border-white/5" />

          {/* VIDEO SECTION */}
          <section className="animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-white mb-6">Uploaded Videos</h3>
            {episode.media && episode.media.filter((m: any) => m.type === 'video').length > 0 ? (
              <div className="flex flex-col gap-3 mb-8">
                {episode.media.filter((m: any) => m.type === 'video').map((video: any) => (
                  <div key={video.id} onClick={() => setActiveVideo(video)} className="bg-white/5 border border-white/10 rounded-lg p-3 shadow-sm flex flex-row items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-48 aspect-video bg-[#050505] border border-white/5 rounded-md overflow-hidden relative flex-shrink-0">
                      {episode.still_path ? (
                        <img src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} alt="Thumbnail" className="w-full h-full object-cover pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <video src={`http://localhost:8000/api/v1/media/${video.id}/stream`} className="w-full h-full object-contain pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg border border-white/20 group-hover:border-red-500 group-hover:scale-110">
                           <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <p className="text-base text-red-500 font-bold truncate group-hover:text-red-400 transition-colors" title={video.metadata?.label || video.original_filename}>
                        {video.metadata?.label || video.original_filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-white/50">{video.metadata?.language || 'Unknown'}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-xs text-white/50">{video.metadata?.content_type || 'Episode'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center pr-4 gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-white/60 font-medium">{video.quality?.name || 'Processing'}</span>
                        <span className="text-xs text-white/30 mt-1">
                          {video.created_at ? new Date(video.created_at).toLocaleDateString('en-CA') : ''}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteVideo(e, video.id)}
                        className="text-white/30 hover:text-red-500 hover:bg-white/5 p-2 rounded-full transition-colors focus:outline-none"
                        title="Delete Video"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50 mb-8">No videos uploaded yet.</p>
            )}

            <hr className="border-white/5 mb-8" />
            <h3 className="text-lg font-bold text-white mb-6">Upload New Video</h3>
            <VideoCreateForm mediableType="episode" mediableId={episode.id} parentTitle={episode.name} inline={true} />
          </section>

        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <button 
              type="button" 
              onClick={() => setActiveVideo(null)} 
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors backdrop-blur-sm shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <video 
              src={`http://localhost:8000/api/v1/media/${activeVideo.id}/stream`} 
              className="w-full h-full" 
              controls 
              autoPlay 
            />
          </div>
        </div>
      )}
    </div>
  );
}
