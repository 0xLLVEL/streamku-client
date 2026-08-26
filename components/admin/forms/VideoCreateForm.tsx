'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import { useTusUpload } from '@/hooks/useTusUpload';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { tmdbImageUrl } from '@/lib/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ProgressBar } from './ProgressBar';
import { createEmbedVideoAction } from '@/app/actions/admin-content';

interface VideoCreateFormProps {
  mediableId: number;
  mediableType: 'movie' | 'episode' | 'tv-show';
  parentTitle: string;
  parentPoster?: string;
  parentTmdbId?: number | string;
  onClose?: () => void;
  inline?: boolean;
  existingVideoQualityIds?: number[];
}

/** Extract a VidKing video ID from a full URL or bare ID.
 *  Accepted forms:
 *   - https://vidking.net/embed/abc123
 *   - https://vidking.net/v/abc123
 *   - abc123  (bare ID)
 */
function parseVidKingId(input: string): string | null {
  const trimmed = input.trim();
  // Match full URL like https://www.vidking.net/embed/movie/12345 or https://vidking.net/embed/tv/12345/1/1
  const urlMatch = trimmed.match(/vidking\.net\/(?:embed|v)\/(?:movie\/|tv\/)?([a-zA-Z0-9_\/-]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9_\/-]+$/.test(trimmed)) return trimmed;
  return null;
}

export function VideoCreateForm({ mediableId, mediableType, parentTitle, parentPoster, parentTmdbId, onClose, inline = false, existingVideoQualityIds = [] }: VideoCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [sourceType, setSourceType] = useState('Upload');

  // Form State
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [quality, setQuality] = useState('');
  const [language, setLanguage] = useState('English');
  const [embedUrl, setEmbedUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // VidKing state (id & error are derived from the raw input)
  const [vidkingInput, setVidkingInput] = useState(parentTmdbId ? String(parentTmdbId) : '');

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

  // Parse VidKing ID from the current input
  const vidkingId = useMemo(() => parseVidKingId(vidkingInput), [vidkingInput]);
  const vidkingError =
    vidkingInput.trim() && !vidkingId
      ? 'Could not extract a VidKing video ID from this URL.'
      : '';

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

  const handleSaveVidKing = async () => {
    if (!vidkingId) return;
    setIsSavingEmbed(true);
    setEmbedSaveStatus('idle');
    setEmbedSaveMessage('');

    const res = await createEmbedVideoAction({
      mediableId,
      mediableType: mediableType as 'movie' | 'tv-show' | 'episode',
      key: vidkingId,
      site: 'VidKing',
      name: name || parentTitle || 'Stream',
    });

    setIsSavingEmbed(false);

    if (res.success) {
      setEmbedSaveStatus('success');
      setEmbedSaveMessage('Stream saved successfully!');
      setVidkingInput('');
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
    if (sourceType === 'VidKing') {
      await handleSaveVidKing();
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
    } else {
      setMessage('Embed saving not yet implemented in this demo.');
      setStatus('error');
    }
  };

  const isSaveDisabled =
    status === 'uploading' || status === 'processing' || isSavingEmbed ||
    (sourceType === 'Upload' && !quality) ||
    (sourceType === 'VidKing' && !vidkingId);

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
          {sourceType === 'VidKing' && vidkingId ? (
            <div className="aspect-video bg-black/30 rounded-xl overflow-hidden shadow-lg border border-white/5 relative">
              <iframe
                src={`https://www.vidking.net/embed/${mediableType === 'movie' ? 'movie' : 'tv'}/${vidkingId}${(mediableType !== 'movie' && !vidkingId.includes('/')) ? '/1/1' : ''}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                title="VidKing Preview"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80 font-medium">VidKing Preview</span>
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
              ) : sourceType === 'VidKing' ? (
                <div className="flex flex-col items-center gap-3 text-white/30">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-sm">Enter a VidKing URL to preview</p>
                </div>
              ) : (
                <button aria-label="Play preview" className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer focus-ring">
                  <svg className="w-8 h-8 text-white/40 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                </button>
              )}
            </div>
          )}

          <ProgressBar progress={progress} status={status} message={message} onPause={pauseUpload} onResume={resumeUpload} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Captions</h3>
              <button className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors duration-200 border border-white/10 cursor-pointer focus-ring">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add caption
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-white/40 border border-dashed border-white/5 rounded-xl">
              <svg className="w-8 h-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
              <p className="text-sm">Captions will be available after uploading the main video.</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-6 h-8 bg-white/10 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  {parentPoster ? <img src={tmdbImageUrl(parentPoster, 'w92') ?? undefined} alt="" className="w-full h-full object-cover" /> : <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M4 4h16v16H4z"></path></svg>}
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
                <button className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold pointer-events-none">Choose File</button>
                <span className="text-white/40 text-sm truncate">No file chosen</span>
                <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" />
              </div>
            </div>
          )}

          {/* Source Type */}
          <div className="space-y-2">
            <Label>Source type</Label>
            <Select value={sourceType} onValueChange={(val) => setSourceType(val || '')}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                <SelectItem value="Upload" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    Direct Upload
                  </span>
                </SelectItem>
                <SelectItem value="VidKing" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    VidKing.net
                  </span>
                </SelectItem>
                <SelectItem value="Embed" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    Custom Embed
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Input */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source</label>

            {sourceType === 'VidKing' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-xs text-blue-300">Paste a VidKing embed URL or video ID</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={vidkingInput}
                    onChange={(e) => setVidkingInput(e.target.value)}
                    placeholder="https://vidking.net/embed/abc123  or  abc123"
                    className={`w-full bg-black/40 border ${vidkingError ? 'border-red-500/50' : vidkingId ? 'border-green-500/40' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/60 transition-colors duration-200 placeholder:text-white/30`}
                  />
                  {vidkingId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>
                {vidkingError && <p className="text-xs text-red-400">{vidkingError}</p>}
                {vidkingId && (
                  <p className="text-xs text-green-400">
                    Video ID: <span className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded">{vidkingId}</span>
                  </p>
                )}
                {embedSaveStatus === 'success' && <p className="text-xs text-green-400 font-medium">{embedSaveMessage}</p>}
                {embedSaveStatus === 'error' && <p className="text-xs text-red-400 font-medium">{embedSaveMessage}</p>}
              </div>
            )}

            {sourceType === 'Embed' && (
              <Textarea value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="Full embed code snippet or just src url" />
            )}

            {sourceType === 'Upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-white/5 border ${videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/30 transition-all`}
              >
                <button className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold pointer-events-none">Choose Video</button>
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
                {isSavingEmbed ? 'Saving...' : sourceType === 'VidKing' ? 'Save VidKing Stream' : 'Upload Video'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
