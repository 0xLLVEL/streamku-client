'use client';

import { artworkUrl } from '@/lib/config.utils';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';

export interface ImageSectionItem {
  id?: number;
  filePath: string;
}

interface ImageSectionProps {
  title: string;
  count: number;
  addLabel: string;
  aspectClass: string;
  thumbSize: 'w500' | 'w780';
  gridClass: string;
  emptyMessage: string;
  items: ImageSectionItem[];
  onPreview: (url: string) => void;
  onDeleteImage: (imageId?: number) => void;
  onAdd?: () => void;
}

/** One image grid (backdrops or posters) with add/preview/delete. */
export function ImageSection({
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
          <PlusIcon className="w-3.5 h-3.5" />
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
                  onPreview(artworkUrl(item.filePath, 'original') ?? '');
                }
              }}
              className={`${aspectClass} bg-black/30 rounded-xl border border-white/10 overflow-hidden relative group/preview cursor-pointer focus-ring`}
              onClick={() => onPreview(artworkUrl(item.filePath, 'original') ?? '')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artworkUrl(item.filePath, thumbSize) ?? undefined}
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
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
