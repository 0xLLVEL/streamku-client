'use client';

import { useState } from 'react';
import { XIcon } from '@/components/ui/icons';
import { useImageUpload } from './hooks/use-image-upload';
import { ImageUploadPane } from './ImageUploadPane';
import { TmdbImageGrid } from './TmdbImageGrid';
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
  const upload = useImageUpload(type, onSelect, onClose);
  if (!open) return null;
  const tmdbImages = type === 'poster' ? images?.posters ?? [] : images?.backdrops ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#121212] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{type === 'poster' ? 'Choose Poster' : 'Choose Backdrop'}</h3>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 px-6 pt-4">
          {(['upload', 'tmdb'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
              {t === 'upload' ? 'Upload' : `TMDB (${tmdbImages.length})`}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'upload' ? (
            <ImageUploadPane type={type} file={upload.file} preview={upload.preview} currentPath={currentPath}
              error={upload.error} uploading={upload.uploading} fileRef={upload.fileRef}
              onFileChange={upload.handleFileChange} onUpload={() => void upload.handleUpload()} />
          ) : (
            <TmdbImageGrid type={type} images={tmdbImages} currentPath={currentPath}
              onSelect={(path) => { onSelect(path); onClose(); }} />
          )}
        </div>
      </div>
    </div>
  );
}
