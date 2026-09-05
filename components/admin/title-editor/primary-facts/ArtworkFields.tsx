'use client';

import { useState } from 'react';
import { SectionCard } from '@/components/admin/ui';
import { artworkUrl } from '@/lib/config.utils';
import { ImagePickerDialog } from '../ImagePickerDialog';
import type { TitleDisplayData } from '../types';

interface ArtworkFieldsProps {
  data: TitleDisplayData;
  onPosterSelect?: (path: string) => void;
  onBackdropSelect?: (path: string) => void;
  onClearPoster?: () => void;
  onClearBackdrop?: () => void;
}

export function ArtworkFields({ data, onPosterSelect, onBackdropSelect, onClearPoster, onClearBackdrop }: ArtworkFieldsProps) {
  const [picker, setPicker] = useState<'poster' | 'backdrop' | null>(null);

  return (
    <SectionCard title="Artwork">
      <input type="hidden" name="poster_path" value={data.poster_path ?? ''} />
      <input type="hidden" name="backdrop_path" value={data.backdrop_path ?? ''} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
          <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
            {data.poster_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl(data.poster_path, 'w342') ?? undefined}
                alt="Poster"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity duration-200"
              />
            )}
            <button
              type="button"
              onClick={() => setPicker('poster')}
              className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer focus-ring"
            >
              Replace image
            </button>
          </div>
          {data.poster_path && onClearPoster && (
            <button
              type="button"
              onClick={onClearPoster}
              className="text-red-400 text-xs font-medium mt-3 hover:underline cursor-pointer transition-colors duration-200"
            >
              Remove image
            </button>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-2">Backdrop</label>
          <div className="aspect-video bg-white/5 rounded-xl border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
            {data.backdrop_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl(data.backdrop_path, 'w1280') ?? undefined}
                alt="Backdrop"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity duration-200"
              />
            )}
            <button
              type="button"
              onClick={() => setPicker('backdrop')}
              className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer focus-ring"
            >
              Replace image
            </button>
          </div>
          {data.backdrop_path && onClearBackdrop && (
            <button
              type="button"
              onClick={onClearBackdrop}
              className="text-red-400 text-xs font-medium mt-3 hover:underline cursor-pointer transition-colors duration-200"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <ImagePickerDialog
        open={picker !== null}
        onClose={() => setPicker(null)}
        type={picker ?? 'poster'}
        images={data.images}
        currentPath={picker === 'poster' ? data.poster_path : data.backdrop_path}
        onSelect={(path) => {
          if (picker === 'poster') onPosterSelect?.(path);
          else onBackdropSelect?.(path);
        }}
      />
    </SectionCard>
  );
}
