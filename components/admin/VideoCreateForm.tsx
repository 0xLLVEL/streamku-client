'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';
import { useTusUpload } from '@/hooks/useTusUpload';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface VideoCreateFormProps {
  mediableId: number;
  mediableType: 'movie' | 'episode' | 'tv-show';
  parentTitle: string;
  parentPoster?: string;
  onClose?: () => void;
  inline?: boolean;
  existingVideoQualityIds?: number[];
}

export function VideoCreateForm({ mediableId, mediableType, parentTitle, parentPoster, onClose, inline = false, existingVideoQualityIds = [] }: VideoCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [sourceType, setSourceType] = useState('Upload');

  // Form State
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [quality, setQuality] = useState('');
  const [language, setLanguage] = useState('English');
  const [contentType, setContentType] = useState(mediableType === 'episode' ? 'Episode' : 'Trailer');
  const [embedUrl, setEmbedUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Upload State Hook
  const { startUpload, pauseUpload, resumeUpload, status, progress, message, setStatus, setMessage } = useTusUpload({
    onSuccess: () => {
      setVideoFile(null);
      if (qualities.length > 0) {
        const availableQ = qualities.find((q: any) => !existingVideoQualityIds.includes(Number(q.id)));
        if (availableQ) setQuality(availableQ.id.toString());
        else setQuality('');
      }
      setTimeout(() => {
        if (onClose) onClose();
        router.refresh();
      }, 1000);
    }
  });

  const [qualities, setQualities] = useState<any[]>([]);

  useEffect(() => {
    const fetchQualities = async () => {
      try {
        const res = await fetchApi('admin/qualities');
        const json = await res.json();
        const qs = json.data || [];
        setQualities(qs);
        if (qs.length > 0) {
          const availableQ = qs.find((q: any) => !existingVideoQualityIds.includes(Number(q.id)));
          if (availableQ) {
            setQuality(availableQ.id.toString());
          } else {
            setQuality(qs[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to fetch qualities', err);
      }
    };
    fetchQualities();
  }, [existingVideoQualityIds]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      if (!name) {
        let autoName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setName(autoName.substring(0, 100));
      }
    }
  };

  const handleSave = async () => {
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
        content_type: contentType,
      });

    } else {
      setMessage('Embed saving not yet implemented in this demo.');
      setStatus('error');
    }
  };

  return (
    <div className={`flex flex-col relative ${inline ? 'bg-transparent' : 'bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 z-50'}`}>

      {!inline && (
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex items-center gap-3 text-2xl font-semibold text-white hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              New video
            </button>
          </div>
          <div className="flex items-center gap-4">
            {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
            <button
              onClick={handleSave}
              disabled={status === 'uploading' || status === 'processing' || !quality}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors border border-white/5 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 ${inline ? '' : 'p-8'} max-w-[1600px] w-full mx-auto`}>
        {/* Left Column - Video Player & Captions */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <div className="aspect-video bg-[#050505] rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5 group">
            {videoFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <h4 className="text-white font-medium text-lg">{videoFile.name}</h4>
                <p className="text-white/40 text-sm mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
              </div>
            ) : (
              <button className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-8 h-8 text-white/40 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              </button>
            )}
          </div>
          
          <ProgressBar 
            progress={progress} 
            status={status} 
            message={message} 
            onPause={pauseUpload} 
            onResume={resumeUpload} 
          />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Captions</h3>
              <button className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors border border-white/5">
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

        {/* Right Column - Form Fields */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          {!inline && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Official Trailer"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
            </div>
          )}

          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="w-6 h-8 bg-white/10 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  {parentPoster ? (
                    <img src={`https://image.tmdb.org/t/p/w200${parentPoster}`} alt="Poster" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"></path></svg>
                  )}
                </div>
                <span className="text-white text-sm truncate">{parentTitle}</span>
              </div>
            </div>
          )}

          {mediableType !== 'movie' && !inline && (
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select value={season} onValueChange={(val) => setSeason(val || '')}>
                <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                  <SelectItem value="1" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Season 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Thumbnail</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-white/10 transition-colors" onClick={() => thumbInputRef.current?.click()}>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors pointer-events-none">Choose File</button>
                <span className="text-white/40 text-sm truncate">No file chosen</span>
                <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="source_type">Source type</Label>
            <Select value={sourceType} onValueChange={(val) => setSourceType(val || '')}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                <SelectItem value="Upload" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Upload</SelectItem>
                <SelectItem value="Embed" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Embed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source</label>
            {sourceType === 'Embed' ? (
              <Textarea
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="Full embed code snippet or just src url"
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-white/5 border ${videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/30 transition-all shadow-sm`}
              >
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors pointer-events-none">Choose Video</button>
                <span className={`text-sm truncate ${videoFile ? 'text-white' : 'text-white/40'}`}>
                  {videoFile ? videoFile.name : 'No file chosen'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleVideoFileChange}
                  accept="video/mp4,video/x-m4v,video/*"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={(val) => setQuality(val || '')}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                {qualities.filter(q => !existingVideoQualityIds.includes(Number(q.id))).map(q => (
                  <SelectItem key={q.id} value={q.id.toString()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                    {q.name} ({q.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val || '')}>
              <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                <SelectItem value="English" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">English</SelectItem>
                <SelectItem value="Indonesian" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Indonesian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!inline && (
            <div className="space-y-2">
              <Label htmlFor="content_type">Content type</Label>
              <Select value={contentType} onValueChange={(val) => setContentType(val || '')}>
                <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                  <SelectItem value="Movie" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Movie</SelectItem>
                  <SelectItem value="Trailer" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Trailer</SelectItem>
                  <SelectItem value="Featurette" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Featurette</SelectItem>
                  <SelectItem value="Teaser" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Teaser</SelectItem>
                  <SelectItem value="Episode" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Episode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {inline && (
            <div className="pt-4 flex flex-col gap-2 mt-auto">
              {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
              <button
                onClick={handleSave}
                disabled={status === 'uploading' || status === 'processing' || !quality}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 border border-white/5"
              >
                Upload Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
