'use client';

import { useState } from 'react';
import { updateSeasonAction, bulkGenerateVidkingEpisodesAction } from '@/app/actions/admin-content-embeds';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/admin/ui';
import { tmdbImageUrl } from '@/lib/config';

export interface SeasonEditEpisode {
  id: number;
  episode_number: number;
  name?: string | null;
  overview?: string | null;
  still_path?: string | null;
  air_date?: string | null;
  runtime?: number | null;
}

export interface SeasonEditData {
  id: number;
  season_number: number;
  name?: string | null;
  overview?: string | null;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: SeasonEditEpisode[];
}

export function SeasonEditForm({ tvShowId, season }: { tvShowId: number | string, season: SeasonEditData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(season.episodes?.length?.toString() || '10');
  const [generateMessage, setGenerateMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleBulkGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    const num = parseInt(totalEpisodes);
    if (!num || num < 1) return;

    setIsGenerating(true);
    setGenerateMessage(null);

    const formData = new FormData();
    formData.append('total_episodes', num.toString());

    const res = await bulkGenerateVidkingEpisodesAction(tvShowId, season.season_number, formData);

    if (res.success) {
      setGenerateMessage({ text: 'Episodes generated successfully!', type: 'success' });
      setTimeout(() => setGenerateMessage(null), 3000);
    } else {
      setGenerateMessage({ text: res.error || 'Failed to generate', type: 'error' });
    }
    setIsGenerating(false);
  };

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
    <form onSubmit={handleSubmit} className="flex flex-col h-[100vh] -m-4 sm:-m-6 lg:-m-8 overflow-hidden relative">
      {/* Sticky Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href={`/admin/tv-shows/${tvShowId}`} aria-label="Go back" className="text-white/40 hover:text-white transition-colors duration-200 cursor-pointer focus-ring rounded-md shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-lg sm:text-2xl font-medium text-white tracking-tight truncate">Edit &ldquo;{season.name}&rdquo;</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {message && (
            <span className={`hidden sm:inline text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <Button type="submit" variant="brand" size="sm" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Tab strip (horizontal on mobile) */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 overflow-x-auto lg:overflow-y-auto bg-transparent py-3 lg:py-6 shrink-0">
          <nav className="flex lg:flex-col px-4 gap-1.5" aria-label="Editor sections">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'true' : undefined}
                className={`whitespace-nowrap text-left px-4 py-2 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${activeTab === tab.id
                  ? 'bg-red-600/15 text-red-400'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Form Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent min-w-0">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl space-y-8 motion-safe:animate-in fade-in duration-300">
              <SectionCard title="Season details">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
                  <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm">
                    {season.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tmdbImageUrl(season.poster_path, 'w500') ?? undefined} alt="Poster" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-sm">No Poster</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={season.name ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="air_date">Air Date</Label>
                    <Input type="date" id="air_date" name="air_date" defaultValue={season.air_date ? season.air_date.split('T')[0] : ''} className="[color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overview">Overview</Label>
                    <Textarea id="overview" name="overview" defaultValue={season.overview ?? ''} rows={5} />
                  </div>
                </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* EPISODES TAB */}
          {activeTab === 'episodes' && (
            <div className="max-w-6xl motion-safe:animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold text-white">Episodes ({season.episodes?.length || 0})</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-white/50">Auto-generate up to:</span>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalEpisodes}
                    onChange={(e) => setTotalEpisodes(e.target.value)}
                    className="w-20 h-8 text-sm"
                  />
                  <Button variant="brand" size="xs" onClick={handleBulkGenerate} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Bulk Generate VidKing'}
                  </Button>
                  {generateMessage && (
                    <span className={`text-xs ml-2 ${generateMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {generateMessage.text}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-xl border border-white/10 bg-black/30 divide-y divide-white/5">
                {season.episodes?.map((episode) => (
                  <div key={episode.id} className="flex items-center gap-3 sm:gap-6 py-3 sm:py-5 px-4 sm:px-6 hover:bg-white/[0.03] transition-colors group">
                    <div className="w-24 sm:w-36 md:w-48 shrink-0 bg-[#1e1e24] relative aspect-video rounded-md overflow-hidden shadow-md border border-white/10">
                      {episode.still_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tmdbImageUrl(episode.still_path, 'w500') ?? undefined} className="w-full h-full object-cover" alt={episode.name ?? undefined} />
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
          )}

        </div>
      </div>
    </form>
  );
}
