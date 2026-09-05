/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client.utils';
import { Button } from '@/components/ui/Button';

interface CaptionsAutoSearchProps {
  parentTmdbId?: number | string;
  mediableId: number | string;
  mediableType: string;
  onImported: () => void;
}

export function CaptionsAutoSearch({ parentTmdbId, mediableId, mediableType, onImported }: CaptionsAutoSearchProps) {
  const [osLang, setOsLang] = useState('en,id');
  const [osSearching, setOsSearching] = useState(false);
  const [osResults, setOsResults] = useState<any[]>([]); // ponytail: any for OpenSubtitles shape
  const [osError, setOsError] = useState('');

  const handleOpenSubtitlesSearch = async () => {
    const raw = String(parentTmdbId ?? '').split('/')[0].trim();
    const tmdbId = Number(raw);
    if (!tmdbId) { setOsError('TMDB ID not available for this title'); return; }
    setOsSearching(true);
    setOsError('');
    setOsResults([]);
    try {
      const res = await apiFetch(`admin/subtitles/search?tmdb_id=${tmdbId}&languages=${encodeURIComponent(osLang)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Search failed');
      const data = json.data?.data ?? [];
      if (json.data?.error) setOsError(json.data.error);
      setOsResults(data.slice(0, 20));
      if (data.length === 0 && !json.data?.error) setOsError('No subtitles found');
    } catch (e: any) {
      setOsError(e.message || 'Search failed');
    }
    setOsSearching(false);
  };

  const handleImport = async (fileId: number, fileName: string, language: string) => {
    setOsError('');
    try {
      const res = await apiFetch('admin/subtitles/import', {
        method: 'POST',
        body: JSON.stringify({
          mediable_id: Number(String(mediableId).split('/')[0]) || Number(mediableId),
          mediable_type: mediableType === 'tv-show' ? 'movie' : mediableType,
          file_id: fileId,
          file_name: fileName,
          language,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Import failed');
      onImported();
    } catch (e: any) {
      setOsError(e.message || 'Import failed');
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex gap-2">
        <input value={osLang} onChange={(e) => setOsLang(e.target.value)} placeholder="languages e.g. en,id" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500/50" />
        <Button variant="brand" size="sm" onClick={handleOpenSubtitlesSearch} disabled={osSearching}>{osSearching ? 'Searching...' : 'Search'}</Button>
      </div>
      <p className="text-xs text-white/30">Uses TMDB ID {String(parentTmdbId ?? '').split('/')[0] || '—'} • Needs OPENSUBTITLES_API_KEY in .env</p>
      {osError && <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{osError}</p>}
      {osResults.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
          {osResults.map((r: any) => {
            const file = r.attributes?.files?.[0];
            if (!file) return null;
            return (
              <div key={r.id} className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-3 py-2">
                <div className="min-w-0 pr-2">
                  <p className="text-xs text-white truncate">{file.file_name} • {r.attributes?.language}</p>
                  <p className="text-xs text-white/40 truncate">{r.attributes?.release ?? ''}</p>
                </div>
                <Button variant="brand" size="xs" onClick={() => handleImport(file.file_id, file.file_name, r.attributes?.language)}>Import</Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
