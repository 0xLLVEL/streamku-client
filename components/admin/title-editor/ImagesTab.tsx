'use client';

import { useState } from 'react';
import { artworkUrl, tmdbImageUrl } from '@/lib/config';
import { ImagePickerDialog } from './ImagePickerDialog';
import type { TitleImageSet } from './types';

interface ImagesTabProps {
  images: TitleImageSet | null | undefined;
  /** Single fallback poster/backdrop from the title record itself. */
  posterPath: string | null | undefined;
  backdropPath: string | null | undefined;
  onPreview: (url: string) => void;
  onDeleteImage: (imageId?: number) => void;
}

const DELETE_ICON_PATH =
  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';

/** Backdrops and posters management grid. */
export function ImagesTab({ images, posterPath, backdropPath, onPreview, onDeleteImage, onPosterSelect, onBackdropSelect }: ImagesTabProps & { onPosterSelect?: (path: string) => void; onBackdropSelect?: (path: string) => void }) {
  const backdrops = images?.backdrops ?? [];
  const posters = images?.posters ?? [];
  const [picker, setPicker] = useState<'poster' | 'backdrop' | null>(null);

  return (
    <div className="max-w-6xl space-y-12 motion-safe:animate-in fade-in duration-300">
      <ImageSection
        title="Backdrops"
        count={backdrops.length || (backdropPath ? 1 : 0)}
        addLabel="Add Backdrop"
        aspectClass="aspect-video"
        thumbSize="w780"
        gridClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        emptyMessage="No backdrops available."
        items={
          backdrops.length > 0
            ? backdrops.slice(0, 12).map((img) => ({ id: img.id, filePath: img.file_path }))
            : backdropPath
              ? [{ id: undefined, filePath: backdropPath }]
              : []
        }
        onPreview={onPreview}
        onDeleteImage={onDeleteImage}
        onAdd={() => setPicker('backdrop')}
      />

      <ImageSection
        title="Posters"
        count={posters.length || (posterPath ? 1 : 0)}
        addLabel="Add Poster"
        aspectClass="aspect-[2/3]"
        thumbSize="w500"
        gridClass="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6"
        emptyMessage="No posters available."
        items={
          posters.length > 0
            ? posters.slice(0, 12).map((img) => ({ id: img.id, filePath: img.file_path }))
            : posterPath
              ? [{ id: undefined, filePath: posterPath }]
              : []
        }
        onPreview={onPreview}
        onDeleteImage={onDeleteImage}
        onAdd={() => setPicker('poster')}
      />

      <ImagePickerDialog
        open={picker !== null}
        onClose={() => setPicker(null)}
        type={picker ?? 'poster'}
        images={images}
        currentPath={picker === 'poster' ? posterPath : backdropPath}
        onSelect={(path) => {
          if (picker === 'poster') onPosterSelect?.(path);
          else onBackdropSelect?.(path);
        }}
      />
    </div>
  );
}

interface ImageSectionProps {
  title: string;
  count: number;
  addLabel: string;
  aspectClass: string;
  thumbSize: 'w500' | 'w780';
  gridClass: string;
  emptyMessage: string;
  items: { id?: number; filePath: string }[];
  onPreview: (url: string) => void;
  onDeleteImage: (imageId?: number) => void;
  onAdd?: () => void;
}

function ImageSection({
  title,
  count,
  addLabel,
  aspectClass,
  thumbSize,
  gridClass,
  emptyMessage,
  items,
  onPreview,
  onDeleteImage,
  onAdd,
}: ImageSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {title} ({count})
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 border border-white/10 cursor-pointer focus-ring"
        >
          <AddIcon />
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-white/50">{emptyMessage}</p>
      ) : (
        <div className={gridClass}>
          {items.map((item, index) => (
            <div
              key={`${item.filePath}-${index}`}
              role="button"
              tabIndex={0}
              aria-label={`Preview ${title.toLowerCase()}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onPreview(artworkUrl(item.filePath, 'original') ?? tmdbImageUrl(item.filePath, 'original') ?? '');
                }
              }}
              className={`${aspectClass} bg-black/30 rounded-xl border border-white/10 overflow-hidden relative group/preview cursor-pointer focus-ring`}
              onClick={() => onPreview(artworkUrl(item.filePath, 'original') ?? tmdbImageUrl(item.filePath, 'original') ?? '')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artworkUrl(item.filePath, thumbSize) ?? tmdbImageUrl(item.filePath, thumbSize) ?? undefined}
                className="w-full h-full object-cover group-hover/preview:scale-[1.03] transition-transform duration-300"
                alt={title}
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteImage(item.id);
                }}
                className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover/preview:opacity-100 focus-visible:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm z-10 cursor-pointer"
                title="Delete image"
                aria-label={`Delete ${title.toLowerCase()} image`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={DELETE_ICON_PATH} />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}
