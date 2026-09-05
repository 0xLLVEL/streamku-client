/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client.utils';
import { useTusUpload } from '@/hooks/use-tus-upload';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { CaptionsAutoSearch } from './CaptionsAutoSearch';

interface CaptionsManagerProps {
  mediableId: number | string;
  mediableType: string;
  tvShowId?: number | string;
  seasonNumber?: number | string;
  parentTmdbId?: number | string;
}

interface SubtitleEntry {
  id: number;
  original_filename: string;
  url: string | null;
  metadata?: { language?: string };
}

export function CaptionsManager({ mediableId, mediableType, tvShowId, seasonNumber, parentTmdbId }: CaptionsManagerProps) {
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [tab, setTab] = useState<'upload' | 'auto'>('upload');
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitleLang, setSubtitleLang] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const subTus = useTusUpload({ onSuccess: () => { setUploadMsg('Subtitle uploaded!'); setSubtitleFile(null); fetchSubtitles(); setUploading(false); setTimeout(() => setUploadMsg(''), 3000); }, onError: (e) => { setUploadMsg(e.message); setUploading(false); } });
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const fetchSubtitles = async () => {
    setLoadingSubs(true);
    try {
      let endpoint = '';
      if (mediableType === 'movie') endpoint = `admin/movies/${mediableId}/media`;
      else if (mediableType === 'episode' && tvShowId && seasonNumber) endpoint = `admin/tv-shows/${tvShowId}/seasons/${seasonNumber}/episodes/${mediableId}/media`;
      else if (mediableType === 'tv-show') endpoint = `admin/tv-shows/${mediableId}/media`;
      if (!endpoint) { setLoadingSubs(false); return; }
      const res = await apiFetch(endpoint);
      if (!res.ok) { setLoadingSubs(false); return; }
      const json = await res.json();
      const media: any[] = json.data ?? json ?? [];
      const subs = Array.isArray(media) ? media.filter((m) => m.type === 'subtitle' || m.collection === 'subtitles') : [];
      setSubtitles(subs);
    } catch {}
    setLoadingSubs(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSubtitles(); }, [mediableId, mediableType, tvShowId, seasonNumber]);

  const handleDeleteSubtitle = async (id: number) => {
    if (!confirm('Delete this subtitle?')) return;
    const res = await apiFetch(`admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) fetchSubtitles();
  };

  const handleUploadSubtitle = async () => {
    if (!subtitleFile) { setUploadMsg('Choose a .srt or .vtt file'); return; }
    setUploading(true);
    setUploadMsg('Uploading...');
    // ponytail: chunk API removed — use tus (same as video) for subtitles
    const mediaTypeForUpload = mediableType === 'tv-show' ? 'movie' : mediableType;
    try {
      await subTus.startUpload(subtitleFile, {
        mediable_id: String(Number(String(mediableId).split('/')[0]) || Number(mediableId)),
        mediable_type: mediaTypeForUpload,
        type: 'subtitle',
        collection: 'subtitles',
        language: subtitleLang,
      });
    } catch (e: any) {
      setUploadMsg(e.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Captions</h3>
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
          <button onClick={() => setTab('upload')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${tab === 'upload' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>Upload</button>
          <button onClick={() => setTab('auto')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${tab === 'auto' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>Auto (OpenSubtitles)</button>
        </div>
      </div>

      {subtitles.length > 0 && (
        <div className="flex flex-col gap-2">
          {subtitles.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{s.original_filename}</p>
                <p className="text-xs text-white/40">{s.metadata?.language ?? 'unknown'} • {s.url ? 'public' : 'stored'}</p>
              </div>
              <button onClick={() => handleDeleteSubtitle(s.id)} className="text-white/40 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 transition-colors" title="Delete">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {loadingSubs && <p className="text-xs text-white/30">Loading captions...</p>}

      {tab === 'upload' ? (
        <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex gap-2">
            <div onClick={() => subtitleInputRef.current?.click()} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:border-white/20 transition-colors">
              <span className="bg-white/10 text-white px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap">Choose File</span>
              <span className="text-xs truncate text-white/60">{subtitleFile ? subtitleFile.name : 'No file (.srt, .vtt)'}</span>
              <input ref={subtitleInputRef} type="file" className="hidden" accept=".srt,.vtt" onChange={(e) => setSubtitleFile(e.target.files?.[0] ?? null)} />
            </div>
            <Select value={subtitleLang} onValueChange={(v) => setSubtitleLang(v ?? 'en')}>
              <SelectTrigger className="w-[110px] bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#18181C] border-white/10 text-white"><SelectItem value="en">English</SelectItem><SelectItem value="id">Indonesian</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="es">Spanish</SelectItem></SelectContent>
            </Select>
          </div>
          <Button variant="brand" size="sm" onClick={handleUploadSubtitle} disabled={uploading || !subtitleFile} className="w-full">{uploading ? 'Uploading...' : 'Upload Caption'}</Button>
          {uploadMsg && <p className="text-xs text-white/60">{uploadMsg}</p>}
          {subtitles.length === 0 && !loadingSubs && <p className="text-xs text-white/30 text-center py-2">No captions yet. Upload .srt/.vtt or use Auto.</p>}
        </div>
      ) : (
        <CaptionsAutoSearch parentTmdbId={parentTmdbId} mediableId={mediableId} mediableType={mediableType} onImported={fetchSubtitles} />
      )}
    </div>
  );
}
