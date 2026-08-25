'use client';

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

/** Fullscreen image preview used by the Images tab. */
export function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 motion-safe:animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close preview"
        className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors duration-200 cursor-pointer focus-ring"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="relative max-w-full max-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}
