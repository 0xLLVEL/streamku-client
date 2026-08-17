'use client';

import { useState, useRef } from 'react';
import { getAuthTokenAction } from '@/app/actions/upload';
import { useRouter } from 'next/navigation';

interface ChunkedUploaderProps {
  mediableId: number;
  mediableType: 'movie' | 'episode';
  type: 'video' | 'subtitle' | 'image';
  label?: string;
  onSuccess?: () => void;
}

export function ChunkedUploader({ mediableId, mediableType, type, label = 'Upload File', onSuccess }: ChunkedUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

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
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          mime_type: file.type,
          total_size: file.size,
          mediable_id: mediableId,
          mediable_type: mediableType,
          type: type,
        })
      });

      if (!initRes.ok) {
        const errorData = await initRes.json();
        throw new Error(errorData.message || 'Failed to initiate upload');
      }

      const initData = await initRes.json();
      const currentUploadId = initData.data.upload_id;
      const chunkSize = initData.data.chunk_size;
      const totalChunks = initData.data.total_chunks;
      setUploadId(currentUploadId);

      // 2. Upload Chunks
      let offset = 0;
      let currentChunkNumber = 0;

      while (offset < file.size) {
        setMessage(`Uploading chunk ${currentChunkNumber + 1} of ${totalChunks}...`);
        const chunk = file.slice(offset, offset + chunkSize);
        
        const formData = new FormData();
        formData.append('chunk_number', currentChunkNumber.toString());
        formData.append('chunk', chunk, file.name); // passing filename might be required by Laravel file validator

        const chunkRes = await fetch(`${API_URL}/admin/uploads/${currentUploadId}/chunks`, {
          method: 'POST',
          headers, // Note: No Content-Type, browser will set multipart/form-data
          body: formData
        });

        if (!chunkRes.ok) {
          const errorData = await chunkRes.json();
          throw new Error(errorData.message || `Failed to upload chunk ${currentChunkNumber}`);
        }

        const chunkData = await chunkRes.json();
        setProgress(chunkData.progress_percent);

        offset += chunkSize;
        currentChunkNumber++;
      }

      // 3. Complete Upload
      setMessage('Processing file... This may take a moment.');
      setStatus('processing');

      const completeRes = await fetch(`${API_URL}/admin/uploads/${currentUploadId}/complete`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
      });

      if (!completeRes.ok) {
        const errorData = await completeRes.json();
        throw new Error(errorData.message || 'Failed to complete upload');
      }

      setStatus('completed');
      setMessage('Upload completed successfully!');
      if (onSuccess) onSuccess();
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred during upload.');
    }
  };

  const handleCancel = async () => {
    if (uploadId) {
       try {
         const token = await getAuthTokenAction();
         await fetch(`${API_URL}/admin/uploads/${uploadId}`, {
           method: 'DELETE',
           headers: {
             'Accept': 'application/json',
             'Authorization': `Bearer ${token}`
           }
         });
       } catch (e) {
         console.error('Failed to cancel upload on server', e);
       }
    }
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setUploadId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 w-full flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">{label}</h3>
        {file && status !== 'uploading' && status !== 'processing' && (
           <button onClick={handleCancel} className="text-xs text-white/40 hover:text-red-400">Clear</button>
        )}
      </div>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-colors group"
        >
          <svg className="w-8 h-8 text-white/30 group-hover:text-red-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <span className="text-sm font-medium text-white/50 group-hover:text-white/80">Click to select a file</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept={type === 'video' ? 'video/mp4,video/x-m4v,video/*' : type === 'image' ? 'image/*' : '*/*'}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {status === 'idle' && (
              <button 
                onClick={handleUpload}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                Upload
              </button>
            )}
          </div>

          {(status === 'uploading' || status === 'processing' || status === 'completed') && (
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs text-white/50 font-medium">
                <span>{message}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${status === 'completed' ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300 relative`}
                  style={{ width: `${progress}%` }}
                >
                  {(status === 'uploading' || status === 'processing') && (
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
             <div className="mt-2 text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-500/20">
               {message}
               <div className="mt-2 flex gap-2">
                  <button onClick={handleUpload} className="text-white hover:underline font-semibold">Try Again</button>
                  <button onClick={handleCancel} className="text-white/50 hover:text-white">Cancel</button>
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
