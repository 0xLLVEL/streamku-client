'use client';

import { useState, useRef } from 'react';
import { getAuthTokenAction } from '@/app/actions/upload';
import { useRouter } from 'next/navigation';

interface VideoCreateFormProps {
  mediableId: number;
  mediableType: 'movie' | 'episode' | 'tv-show';
  parentTitle: string;
  parentPoster?: string;
  onClose: () => void;
}

export function VideoCreateForm({ mediableId, mediableType, parentTitle, parentPoster, onClose }: VideoCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [sourceType, setSourceType] = useState('Upload');
  
  // Form State
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [quality, setQuality] = useState('regular');
  const [language, setLanguage] = useState('English');
  const [contentType, setContentType] = useState('Trailer');
  const [embedUrl, setEmbedUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Upload State
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setMessage('');
      if (!name) {
         // Auto-fill name without extension
         setName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
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

      setStatus('uploading');
      setProgress(0);
      setMessage('Initiating upload...');

      try {
        const token = await getAuthTokenAction();
        if (!token) throw new Error('Authentication required');

        const headers: HeadersInit = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // 1. Initiate Upload
        const initRes = await fetch(`${API_URL}/admin/uploads/initiate`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: videoFile.name,
            mime_type: videoFile.type || 'video/mp4',
            total_size: videoFile.size,
            mediable_id: mediableId,
            mediable_type: mediableType,
            type: 'video',
            metadata: {
              label: name,
              language: language,
              content_type: contentType
            }
          })
        });

        if (!initRes.ok) {
          const errData = await initRes.json();
          throw new Error(errData.message || 'Failed to initiate upload');
        }

        const { data: initData } = await initRes.json();
        const currentUploadId = initData.upload_id;
        setUploadId(currentUploadId);

        const chunkSize = initData.chunk_size;
        const totalChunks = initData.total_chunks;
        
        // 2. Upload Chunks
        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
          const start = chunkNumber * chunkSize;
          const end = Math.min(start + chunkSize, videoFile.size);
          const chunkBlob = videoFile.slice(start, end);

          const formData = new FormData();
          formData.append('chunk_number', chunkNumber.toString());
          formData.append('chunk', chunkBlob);

          setMessage(`Uploading chunk ${chunkNumber + 1} of ${totalChunks}...`);

          const chunkRes = await fetch(`${API_URL}/admin/uploads/${currentUploadId}/chunk`, {
            method: 'POST',
            headers: headers,
            body: formData,
          });

          if (!chunkRes.ok) {
             throw new Error(`Failed to upload chunk ${chunkNumber}`);
          }

          const chunkData = await chunkRes.json();
          setProgress(chunkData.progress_percent);
        }

        // 3. Complete Upload
        setStatus('processing');
        setMessage('Processing video...');

        const completeRes = await fetch(`${API_URL}/admin/uploads/${currentUploadId}/complete`, {
          method: 'POST',
          headers: headers
        });

        if (!completeRes.ok) {
          const errorData = await completeRes.json();
          throw new Error(errorData.message || 'Failed to complete upload');
        }

        setStatus('completed');
        setMessage('Video uploaded and saved successfully!');
        
        setTimeout(() => {
           onClose();
           router.refresh();
        }, 1500);

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
    <div className="flex flex-col bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 relative z-50">
      
      {/* Uploading Overlay */}
      {status !== 'idle' && status !== 'error' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl">
             {status === 'completed' ? (
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4 animate-in zoom-in duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
             ) : (
                <svg className="animate-spin h-10 w-10 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             )}
             <h3 className="text-xl font-bold text-white mb-2">{status === 'completed' ? 'Success!' : status === 'processing' ? 'Processing...' : 'Uploading Video'}</h3>
             <p className="text-sm text-white/50 mb-6">{message}</p>
             
             {status === 'uploading' && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500 h-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#121212]">
        <button onClick={onClose} className="flex items-center gap-3 text-2xl font-semibold text-white hover:text-red-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          New video
        </button>
        <div className="flex items-center gap-4">
          {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
          <button 
            onClick={handleSave}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors border border-white/5"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8 max-w-[1600px] w-full mx-auto">
        {/* Left Column - Video Player & Captions */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <div className="aspect-video bg-[#050505] rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5 group">
            {videoFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                 <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 <h4 className="text-white font-medium text-lg">{videoFile.name}</h4>
                 <p className="text-white/40 text-sm mt-1">{(videoFile.size / (1024*1024)).toFixed(2)} MB • Ready to upload</p>
              </div>
            ) : (
              <button className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-8 h-8 text-white/40 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              </button>
            )}
          </div>

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
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none focus:bg-white/5 transition-colors" 
              placeholder="e.g. Official Trailer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
            <div className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 flex items-center gap-3">
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

          {mediableType !== 'movie' && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2">Season</label>
              <select 
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white/70 text-sm focus:outline-none focus:border-red-500 focus:bg-[#111111] transition-colors appearance-none"
              >
                <option value="">Select a season (optional)</option>
                <option value="1">Season 1</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Thumbnail</label>
            <div className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors" onClick={() => thumbInputRef.current?.click()}>
              <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors pointer-events-none">Choose File</button>
              <span className="text-white/40 text-sm truncate">No file chosen</span>
              <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Source type</label>
            <div className="relative">
              <select 
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 focus:bg-[#111111] transition-colors appearance-none"
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
                className="w-full bg-transparent border border-white/10 rounded px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-red-500 focus:bg-white/5 transition-colors h-24 resize-none"
                placeholder="Full embed code snippet or just src url"
              ></textarea>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-transparent border ${videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors`}
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
                className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 focus:bg-[#111111] transition-colors appearance-none"
              >
                <option value="regular">regular</option>
                <option value="HD">HD</option>
                <option value="4K">4K</option>
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
                className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 focus:bg-[#111111] transition-colors appearance-none"
              >
                <option value="English">English</option>
                <option value="Indonesian">Indonesian</option>
              </select>
              <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Content type</label>
            <div className="relative">
              <select 
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 focus:bg-[#111111] transition-colors appearance-none"
              >
                <option value="Trailer">Trailer</option>
                <option value="Featurette">Featurette</option>
                <option value="Teaser">Teaser</option>
                <option value="Episode">Episode</option>
              </select>
              <svg className="w-4 h-4 text-white/40 absolute right-4 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
