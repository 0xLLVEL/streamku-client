'use client';

import { useState, useRef, useEffect } from 'react';
import { getAuthTokenAction } from '@/app/actions/upload';
import { useRouter } from 'next/navigation';
import * as tus from 'tus-js-client';

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

  // Upload State
  const [status, setStatus] = useState<'idle' | 'uploading' | 'paused' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);
  const [qualities, setQualities] = useState<any[]>([]);

  const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchQualities = async () => {
      try {
        const token = await getAuthTokenAction();
        if (!token) return;
        const res = await fetch(`${API_URL}/admin/qualities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
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
        }
      } catch (err) {
        console.error('Failed to fetch qualities', err);
      }
    };
    fetchQualities();
  }, [API_URL]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setMessage('');
      if (!name) {
        // Auto-fill name without extension and truncate to max 100 chars
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

      if (status === 'paused' && tusUploadRef.current) {
        tusUploadRef.current.start();
        setStatus('uploading');
        return;
      }

      setStatus('uploading');
      setProgress(0);
      setMessage('Initiating upload...');

      try {
        const token = await getAuthTokenAction();
        if (!token) throw new Error('Authentication required');

        const upload = new tus.Upload(videoFile, {
          endpoint: `${API_URL}/admin/tus`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          metadata: {
            name: videoFile.name,
            filename: videoFile.name,
            extension: videoFile.name.split('.').pop() || 'mp4',
            filetype: videoFile.type || 'video/mp4',
            mediable_id: mediableId.toString(),
            mediable_type: mediableType,
            quality_id: quality,
            type: 'video',
            collection: 'video',
            label: (inline && parentTitle) ? parentTitle.substring(0, 100) : (name ? name.substring(0, 100) : ''),
            language: language,
            content_type: contentType,
            size: videoFile.size.toString(),
          },
          onError: function (error) {
            console.error('TUS Error:', error);
            setStatus('error');
            setMessage('Failed because: ' + error);
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            const percentage = (bytesUploaded / bytesTotal) * 100;
            setProgress(percentage);
            
            const uploadedMB = (bytesUploaded / (1024 * 1024)).toFixed(2);
            const totalMB = (bytesTotal / (1024 * 1024)).toFixed(2);
            setMessage(`Uploading ${uploadedMB} MB / ${totalMB} MB...`);
          },
          onSuccess: function () {
            setStatus('completed');
            setMessage('Upload complete!');
            setVideoFile(null);
            tusUploadRef.current = null;
            
            if (qualities.length > 0) {
              const availableQ = qualities.find((q: any) => !existingVideoQualityIds.includes(Number(q.id)));
              if (availableQ) {
                setQuality(availableQ.id.toString());
              }
            } else {
              setQuality('');
            }
            
            setTimeout(() => {
              if (onClose) onClose();
              router.refresh();
            }, 1000);
          },
        });

        tusUploadRef.current = upload;
        upload.start();

      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred during upload.');
      }
    } else {
      // Embed logic would go here
      setMessage('Embed saving not yet implemented in this demo.');
      setStatus('error');
    }
  };

  return (
    <div className={`flex flex-col relative ${inline ? 'bg-transparent' : 'bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 z-50'}`}>


      {/* Header (Only shown when not inline) */}
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
          
          {/* Upload Progress Below Video Player */}
          {status !== 'idle' && status !== 'error' && (
            <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-2 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {status === 'completed' ? (
                     <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                     <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  <span className="font-medium text-white/90 truncate">{status === 'completed' ? 'Success!' : status === 'processing' ? 'Processing...' : status === 'paused' ? 'Paused' : 'Uploading Video'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                  <span>{message}</span>
                  {(status === 'uploading' || status === 'paused') && <span className="text-white/70 font-semibold">{Math.round(progress)}%</span>}
                  
                  {status === 'uploading' && (
                    <button type="button" onClick={() => {
                        tusUploadRef.current?.abort();
                        setStatus('paused');
                        setMessage('Upload paused');
                    }} className="ml-2 hover:text-white transition-colors bg-white/10 px-2 py-0.5 rounded" title="Pause Upload">
                      <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                  )}
                  {status === 'paused' && (
                    <button type="button" onClick={handleSave} className="ml-2 hover:text-white transition-colors bg-white/10 px-2 py-0.5 rounded" title="Resume Upload">
                      <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  )}
                </div>
              </div>
              {(status === 'uploading' || status === 'paused') && (
                <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                  <div className={`h-full transition-all duration-150 relative ${status === 'paused' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }}>
                    {status === 'uploading' && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                  </div>
                </div>
              )}
            </div>
          )}

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
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 shadow-sm text-white text-sm focus:border-red-600 focus:outline-none focus:bg-white/5 transition-colors"
                placeholder="e.g. Official Trailer"
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
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 shadow-sm text-white/70 text-sm focus:outline-none focus:border-red-600 focus:bg-white/10 transition-colors appearance-none"
              >
                <option value="">Select a season (optional)</option>
                <option value="1">Season 1</option>
              </select>
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

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source type</label>
            <div className="relative">
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white/10 transition-all appearance-none shadow-sm"
              >
                <option value="Upload">Upload</option>
                <option value="Embed">Embed</option>
              </select>
              <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source</label>
            {sourceType === 'Embed' ? (
              <textarea
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white/10 transition-all h-24 resize-none shadow-sm"
                placeholder="Full embed code snippet or just src url"
              ></textarea>
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

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Quality</label>
            <div className="relative">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white/10 transition-all appearance-none shadow-sm"
              >
                {qualities.map(q => {
                  const qId = Number(q.id);
                  const isUploaded = existingVideoQualityIds.includes(qId);
                  return (
                    <option
                      key={qId}
                      value={qId}
                      disabled={isUploaded}
                    >
                      {q.name} ({q.label}) {isUploaded ? '- Already Uploaded' : ''}
                    </option>
                  );
                })}
              </select>
              <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white/10 transition-all appearance-none shadow-sm"
              >
                <option value="English">English</option>
                <option value="Indonesian">Indonesian</option>
              </select>
              <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {!inline && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Content type</label>
              <div className="relative">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white/10 transition-all appearance-none shadow-sm"
                >
                  <option value="Movie">Movie</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Featurette">Featurette</option>
                  <option value="Teaser">Teaser</option>
                  <option value="Episode">Episode</option>
                </select>
                <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
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
