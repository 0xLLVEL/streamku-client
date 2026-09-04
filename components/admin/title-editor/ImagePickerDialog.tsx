'use client';

import { useState, useRef } from 'react';
import { artworkUrl, tmdbImageUrl } from '@/lib/config';
import { uploadImageAction } from '@/app/actions/admin-content-media';
import { Button } from '@/components/ui/Button';
import type { TitleImageSet } from './types';

interface ImagePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  type: 'poster' | 'backdrop';
  images?: TitleImageSet | null;
  currentPath?: string | null;
}

export function ImagePickerDialog({ open, onClose, onSelect, type, images, currentPath }: ImagePickerDialogProps) {
  const [tab, setTab] = useState<'upload' | 'tmdb'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tmdbImages = type === 'poster' ? images?.posters ?? [] : images?.backdrops ?? [];

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('type', type);
    const res = await uploadImageAction(fd);
    setUploading(false);
    if (res.success && res.path) {
      onSelect(res.path);
      onClose();
      setFile(null);
      setPreview(null);
    } else {
      setError(res.error || 'Upload failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#121212] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {type === 'poster' ? 'Choose Poster' : 'Choose Backdrop'}
          </h3>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => setTab('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'upload' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
          >
            Upload
          </button>
          <button
            onClick={() => setTab('tmdb')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tmdb' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
          >
            TMDB ({tmdbImages.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'upload' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white/[0.02]"
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
                ) : currentPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={artworkUrl(currentPath, type === 'poster' ? 'w342' : 'w780') ?? ''} alt="Current" className="mx-auto max-h-64 rounded-lg object-contain opacity-60" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.594-4.594a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm">Click to select image (JPG, PNG, max 5MB)</span>
                  </div>
                )}
                {file && <p className="mt-3 text-sm text-white/60">{file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
              </div>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
              <Button onClick={handleUpload} disabled={!file || uploading} variant="brand" className="w-full">
                {uploading ? 'Uploading...' : 'Upload & Use'}
              </Button>
            </div>
          ) : (
            <div>
              {tmdbImages.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">No TMDB images available. Try importing from TMDB first or use Upload.</p>
              ) : (
                <div className={type === 'poster' ? 'grid grid-cols-3 sm:grid-cols-4 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                  {tmdbImages.slice(0, 20).map((img, idx) => (
                    <button
                      key={`${img.file_path}-${idx}`}
                      onClick={() => {
                        onSelect(img.file_path);
                        onClose();
                      }}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${currentPath === img.file_path ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/10 hover:border-white/30'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tmdbImageUrl(img.file_path, type === 'poster' ? 'w342' : 'w500') ?? ''} alt="" className="w-full h-auto object-cover" />
                      {currentPath === img.file_path && (
                        <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Current</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
