'use client';

import { useState } from 'react';
import { ImagePickerDialog } from './ImagePickerDialog';
import { ImageSection } from './ImageSection';
import type { TitleImageSet } from './types';

interface ImagesTabProps {
  images: TitleImageSet | null | undefined;
  /** Single fallback poster/backdrop from the title record itself. */
  posterPath: string | null | undefined;
  backdropPath: string | null | undefined;
  onPreview: (url: string) => void;
  onDeleteImage: (imageId?: number) => void;
}

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
