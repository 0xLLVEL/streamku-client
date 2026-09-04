/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/apiClient';
import { useTusUpload } from '@/hooks/useTusUpload';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { buildEmbedUrl, parseProviderId, STREAM_PROVIDERS, tmdbImageUrl, type StreamProvider } from '@/lib/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ProgressBar } from './ProgressBar';
import { createEmbedVideoAction } from '@/app/actions/admin-content-embeds';

interface VideoCreateFormProps {
  mediableId: number;
  mediableType: 'movie' | 'episode' | 'tv-show';
  parentTitle: string;
  parentPoster?: string;
  parentTmdbId?: number | string;
  tvShowId?: number | string;
  seasonNumber?: number | string;
  onClose?: () => void;
  inline?: boolean;
  existingVideoQualityIds?: number[];
}

type SourceType = 'Upload' | StreamProvider;
const PROVIDER_OPTIONS = Object.entries(STREAM_PROVIDERS) as [StreamProvider, { label: string; base: string }][];

function isProviderSource(v: string): v is StreamProvider {
  return v in STREAM_PROVIDERS;
}

export function VideoCreateForm({ mediableId, mediableType, parentTitle, parentPoster, parentTmdbId, tvShowId, seasonNumber, onClose, inline = false, existingVideoQualityIds = [] }: VideoCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [sourceType, setSourceType] = useState<SourceType>('Upload');

  // Form State
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [quality, setQuality] = useState('');
  const [language, setLanguage] = useState('English');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Provider state (id & error are derived from the raw input)
  const [providerInput, setProviderInput] = useState(parentTmdbId ? String(parentTmdbId) : '');

  const [isSavingEmbed, setIsSavingEmbed] = useState(false);
  const [embedSaveMessage, setEmbedSaveMessage] = useState('');
  const [embedSaveStatus, setEmbedSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { startUpload, pauseUpload, resumeUpload, status, progress, message, setStatus, setMessage } = useTusUpload({
    onSuccess: () => {
      setVideoFile(null);
      if (qualities.length > 0) {
        const availableQ = qualities.find((q) => !existingVideoQualityIds.includes(Number(q.id)));
        if (availableQ) setQuality(availableQ.id.toString());
        else setQuality('');
      }
      setTimeout(() => {
        if (onClose) onClose();
        router.refresh();
      }, 1000);
    }
  });

  interface QualityOption {
    id: number | string;
    name?: string;
    label?: string;
  }

  const [qualities, setQualities] = useState<QualityOption[]>([]);

  useEffect(() => {
    const fetchQualities = async () => {
      try {
        const res = await apiFetch('admin/qualities');
        const json = await res.json();
        const qs: QualityOption[] = json.data || [];
        setQualities(qs);
        if (qs.length > 0) {
          const availableQ = qs.find((q) => !existingVideoQualityIds.includes(Number(q.id)));
          if (availableQ) setQuality(availableQ.id.toString());
          else setQuality(qs[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch qualities', err);
      }
    };
    fetchQualities();
  }, [existingVideoQualityIds]);

  // Parse provider ID from the current input
  const providerId = useMemo(() => {
    if (!isProviderSource(sourceType)) return null;
    return parseProviderId(sourceType, providerInput);
  }, [providerInput, sourceType]);
  const providerError =
    providerInput.trim() && !providerId && isProviderSource(sourceType)
      ? `Could not extract a ${sourceType} ID from this URL.`
      : '';

  const providerPreviewUrl = useMemo(() => {
    if (!isProviderSource(sourceType) || !providerId) return null;
    return buildEmbedUrl(sourceType, providerId, mediableType === 'movie' ? 'movie' : 'tv');
  }, [sourceType, providerId, mediableType]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      if (!name) {
        setName(e.target.files[0].name.replace(/\.[^/.]+$/, '').substring(0, 100));
      }
    }
  };

  const handleSaveProvider = async () => {
    if (!providerId || !isProviderSource(sourceType)) return;
    setIsSavingEmbed(true);
    setEmbedSaveStatus('idle');
    setEmbedSaveMessage('');

    const res = await createEmbedVideoAction({
      mediableId,
      mediableType: mediableType as 'movie' | 'tv-show' | 'episode',
      tvShowId,
      seasonNumber,
      key: providerId,
      site: sourceType,
      name: name || parentTitle || 'Stream',
    });

    setIsSavingEmbed(false);

    if (res.success) {
      setEmbedSaveStatus('success');
      setEmbedSaveMessage('Stream saved successfully!');
      setProviderInput('');
      setTimeout(() => {
        if (onClose) onClose();
        router.refresh();
      }, 1200);
    } else {
      setEmbedSaveStatus('error');
      setEmbedSaveMessage(res.error || 'Failed to save stream.');
    }
  };

  const handleSave = async () => {
    if (isProviderSource(sourceType)) {
      await handleSaveProvider();
      return;
    }

    if (sourceType === 'Upload') {
      if (!videoFile) {
        setMessage('Please select a video file first.');
        setStatus('error');
        return;
      }
      startUpload(videoFile, {
        mediable_id: mediableId.toString(),
        mediable_type: mediableType,
        quality_id: quality,
        type: 'video',
        collection: 'video',
        label: (inline && parentTitle) ? parentTitle.substring(0, 100) : (name ? name.substring(0, 100) : ''),
        language: language,
      });
    }
  };

  const isProvider = isProviderSource(sourceType);
  const isSaveDisabled =
    status === 'uploading' || status === 'processing' || isSavingEmbed ||
    (sourceType === 'Upload' && !quality) ||
    (isProvider && !providerId);

  return (
    <div className={`flex flex-col relative ${inline ? 'bg-transparent' : 'bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-2xl motion-safe:animate-in zoom-in-95 duration-300 z-50'}`}>

      {!inline && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-[#121212]">
          <button onClick={onClose} aria-label="Close" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-semibold text-white hover:text-red-400 transition-colors duration-200 cursor-pointer focus-ring rounded-md min-w-0">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="truncate">New video</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
            {embedSaveStatus === 'error' && <span className="text-sm text-red-400 font-medium">{embedSaveMessage}</span>}
            {embedSaveStatus === 'success' && <span className="text-sm text-green-400 font-medium">{embedSaveMessage}</span>}
            <Button variant="brand" size="sm" onClick={handleSave} disabled={isSaveDisabled}>
              {isSavingEmbed ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-6 sm:gap-8 ${inline ? '' : 'p-4 sm:p-8'} max-w-[1600px] w-full mx-auto`}>
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">

          {/* Preview Area */}
          {isProvider && providerId && providerPreviewUrl ? (
            <div className="aspect-video bg-black/30 rounded-xl overflow-hidden shadow-lg border border-white/5 relative">
              <iframe
                src={providerPreviewUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                title={`${sourceType} Preview`}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80 font-medium">{sourceType} Preview</span>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
              {videoFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  <h4 className="text-white font-medium text-lg">{videoFile.name}</h4>
                  <p className="text-white/40 text-sm mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                </div>
              ) : isProvider ? (
                <div className="flex flex-col items-center gap-3 text-white/30">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-sm">Enter a {sourceType} URL to preview</p>
                </div>
              ) : (
                <button aria-label="Play preview" className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer focus-ring">
                  <svg className="w-8 h-8 text-white/40 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                </button>
              )}
            </div>
          )}

          <ProgressBar progress={progress} status={status} message={message} onPause={pauseUpload} onResume={resumeUpload} />

          {sourceType === 'Upload' && (
            <CaptionsManager
              mediableId={mediableId}
              mediableType={mediableType}
              tvShowId={tvShowId}
              seasonNumber={seasonNumber}
              parentTmdbId={parentTmdbId}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-6 h-8 bg-white/10 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                  {parentPoster ? <Image src={tmdbImageUrl(parentPoster, 'w92') ?? ''} alt="" fill sizes="24px" className="object-cover" /> : <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M4 4h16v16H4z"></path></svg>}
                </div>
                <span className="text-white text-sm truncate">{parentTitle}</span>
              </div>
            </div>
          )}

          {mediableType !== 'movie' && !inline && (
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select value={season} onValueChange={(val) => setSeason(val || '')}>
                <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                  <SelectItem value="1" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Season 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Thumbnail</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors" onClick={() => thumbInputRef.current?.click()}>
                <span className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Choose File</span>
                <span className="text-white/40 text-sm truncate">No file chosen</span>
                <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" />
              </div>
            </div>
          )}

          {/* Source Type */}
          <div className="space-y-2">
            <Label>Source type</Label>
            <Select value={sourceType} onValueChange={(val) => setSourceType((val || 'Upload') as SourceType)}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl max-h-[300px]">
                <SelectItem value="Upload" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    Direct Upload
                  </span>
                </SelectItem>
                {PROVIDER_OPTIONS.map(([key, p]) => (
                  <SelectItem key={key} value={key} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {p.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Input */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source</label>

            {isProvider && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-xs text-blue-300">Paste a {sourceType} embed URL or TMDB ID</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={providerInput}
                    onChange={(e) => setProviderInput(e.target.value)}
                    placeholder={sourceType === 'VidLink' ? 'https://vidlink.pro/movie/27205  or  27205' : `https://.../embed/...  or  TMDB ID`}
                    className={`w-full bg-black/40 border ${providerError ? 'border-red-500/50' : providerId ? 'border-green-500/40' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/60 transition-colors duration-200 placeholder:text-white/30`}
                  />
                  {providerId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>
                {providerError && <p className="text-xs text-red-400">{providerError}</p>}
                {providerId && (
                  <p className="text-xs text-green-400">
                    Video ID: <span className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded">{providerId}</span>
                  </p>
                )}
                {embedSaveStatus === 'success' && <p className="text-xs text-green-400 font-medium">{embedSaveMessage}</p>}
                {embedSaveStatus === 'error' && <p className="text-xs text-red-400 font-medium">{embedSaveMessage}</p>}
              </div>
            )}

            {sourceType === 'Upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-white/5 border ${videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/30 transition-all`}
              >
                <span className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Choose Video</span>
                <span className={`text-sm truncate ${videoFile ? 'text-white' : 'text-white/40'}`}>{videoFile ? videoFile.name : 'No file chosen'}</span>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleVideoFileChange} accept="video/mp4,video/x-m4v,video/*" />
              </div>
            )}
          </div>

          {/* Quality – only for Upload */}
          {sourceType === 'Upload' && (
            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={(val) => setQuality(val || '')}>
                <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                  {qualities.filter(q => !existingVideoQualityIds.includes(Number(q.id))).map(q => (
                    <SelectItem key={q.id} value={q.id.toString()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                      {q.name} ({q.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val || '')}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                <SelectItem value="English" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">English</SelectItem>
                <SelectItem value="Indonesian" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Indonesian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inline && (
            <div className="pt-4 flex flex-col gap-2 mt-auto">
              {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
              {embedSaveStatus === 'error' && <span className="text-sm text-red-400 font-medium">{embedSaveMessage}</span>}
              {embedSaveStatus === 'success' && <span className="text-sm text-green-400 font-medium">{embedSaveMessage}</span>}
              <Button variant="brand" className="w-full" onClick={handleSave} disabled={isSaveDisabled}>
                {isSavingEmbed ? 'Saving...' : isProvider ? `Save ${sourceType} Stream` : 'Upload Video'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaptionsManager({ mediableId, mediableType, tvShowId, seasonNumber, parentTmdbId }: { mediableId: number | string; mediableType: string; tvShowId?: number | string; seasonNumber?: number | string; parentTmdbId?: number | string }) {
  const [subtitles, setSubtitles] = useState<{ id: number; original_filename: string; url: string | null; metadata?: { language?: string } }[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [tab, setTab] = useState<'upload' | 'auto'>('upload');
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitleLang, setSubtitleLang] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [osLang, setOsLang] = useState('en,id');
  const [osSearching, setOsSearching] = useState(false);
  const [osResults, setOsResults] = useState<any[]>([]); // ponytail: any for OpenSubtitles shape
  const [osError, setOsError] = useState('');
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

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
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
    try {
      const mediaTypeForUpload = mediableType === 'tv-show' ? 'movie' : mediableType; // ponytail: tv-show not supported as mediable for upload, fallback to movie
      const initRes = await apiFetch('admin/uploads/initiate', {
        method: 'POST',
        body: JSON.stringify({
          filename: subtitleFile.name,
          mime_type: subtitleFile.type || 'application/x-subrip',
          total_size: subtitleFile.size,
          media_id: Number(String(mediableId).split('/')[0]) || Number(mediableId),
          media_type: mediaTypeForUpload,
          type: 'subtitle',
          collection: 'subtitles',
          metadata: { language: subtitleLang },
        }),
      });
      if (!initRes.ok) throw new Error('Initiate failed');
      const initJson = await initRes.json();
      const uploadId = initJson.data?.upload_id || initJson.upload_id;
      const form = new FormData();
      form.append('chunk', subtitleFile);
      form.append('chunk_number', '0');
      const chunkRes = await apiFetch(`admin/uploads/${uploadId}/chunks`, { method: 'POST', body: form as any });
      if (!chunkRes.ok) throw new Error('Chunk upload failed');
      const compRes = await apiFetch(`admin/uploads/${uploadId}/complete`, { method: 'POST' });
      if (!compRes.ok) throw new Error('Complete failed');
      setUploadMsg('Subtitle uploaded!');
      setSubtitleFile(null);
      fetchSubtitles();
    } catch (e: any) {
      setUploadMsg(e.message || 'Upload failed');
    }
    setUploading(false);
    setTimeout(() => setUploadMsg(''), 3000);
  };

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
      fetchSubtitles();
    } catch (e: any) {
      setOsError(e.message || 'Import failed');
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
      )}
    </div>
  );
}
