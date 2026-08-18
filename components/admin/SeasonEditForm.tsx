'use client';

import { useState } from 'react';
import { updateSeasonAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function SeasonEditForm({ tvShowId, season }: { tvShowId: number | string, season: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateSeasonAction(tvShowId, season.season_number, formData);

    if (res.success) {
      setMessage({ text: 'Season updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      setIsSaving(false);
    } else {
      setMessage({ text: res.error || 'Failed to update', type: 'error' });
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'episodes', label: 'Episodes' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[100vh] -m-6 md:-m-8">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href={`/admin/tv-shows/${tvShowId}`} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">Edit &ldquo;{season.name}&rdquo;</h1>
        </div>

        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={isSaving} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-medium text-sm transition-all disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 overflow-y-auto bg-transparent py-6">
          <nav className="flex flex-col px-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2 rounded-md transition-colors duration-150 text-[13px] font-medium ${activeTab === tab.id
                    ? 'bg-red-500/10 text-red-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Form Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-transparent">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
                  <div className="aspect-[2/3] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm">
                    {season.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w500${season.poster_path}`} alt="Poster" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-sm">No Poster</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Name</label>
                    <input type="text" name="name" defaultValue={season.name} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Air Date</label>
                    <input type="date" name="air_date" defaultValue={season.air_date ? season.air_date.split('T')[0] : ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all shadow-sm [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Overview</label>
                    <textarea name="overview" defaultValue={season.overview} rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none focus:bg-white/10 transition-all resize-y shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EPISODES TAB */}
          {activeTab === 'episodes' && (
            <div className="max-w-6xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Episodes ({season.episodes?.length || 0})</h2>
              <div className="flex flex-col rounded-xl border border-white/5 bg-[#050505] divide-y divide-white/5">
                {season.episodes?.map((episode: any) => (
                  <div key={episode.id} className="flex items-center gap-6 py-5 px-6 hover:bg-white/[0.03] transition-colors group">
                    <div className="w-36 md:w-48 shrink-0 bg-[#1e1e24] relative aspect-video rounded-md overflow-hidden shadow-md border border-white/5">
                      {episode.still_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} className="w-full h-full object-cover" alt={episode.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Photo</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-white truncate" title={episode.name}>
                           <span className="text-white/40 mr-3 font-mono text-sm">S{season.season_number} E{episode.episode_number}</span>
                           {episode.name}
                        </p>
                        <p className="text-white/50 text-sm mt-1.5 line-clamp-2">{episode.overview || 'No overview available.'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm text-white/40 shrink-0 font-medium">
                        {episode.air_date && <span>{episode.air_date.split('T')[0]}</span>}
                        {episode.runtime > 0 && <span className="text-xs text-white/30">{episode.runtime} min</span>}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 pl-4 transition-opacity flex items-center gap-2">
                       <Link href={`/admin/tv-shows/${tvShowId}/seasons/${season.season_number}/episodes/${episode.episode_number}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all shadow-sm" title="Edit Episode">
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
          )}

        </div>
      </div>
    </form>
  );
}
