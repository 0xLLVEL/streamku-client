'use client';

import { tmdbImageUrl } from '@/lib/config.utils';

interface TmdbImageGridProps {
  type: 'poster' | 'backdrop';
  images: { file_path: string }[];
  currentPath?: string | null;
  onSelect: (path: string) => void;
}

export function TmdbImageGrid({ type, images, currentPath, onSelect }: TmdbImageGridProps) {
  if (images.length === 0) {
    return <p className="text-white/50 text-sm text-center py-8">No TMDB images available. Try importing from TMDB first or use Upload.</p>;
  }
  return (
    <div className={type === 'poster' ? 'grid grid-cols-3 sm:grid-cols-4 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
      {images.slice(0, 20).map((img, idx) => (
        <button
          key={`${img.file_path}-${idx}`}
          onClick={() => onSelect(img.file_path)}
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
  );
}
