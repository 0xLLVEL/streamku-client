'use client';

import { artworkUrl } from '@/lib/config.utils';
import { Button } from '@/components/ui/Button';

interface ImageUploadPaneProps {
  type: 'poster' | 'backdrop';
  file: File | null;
  preview: string | null;
  currentPath?: string | null;
  error: string | null;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function ImageUploadPane({ type, file, preview, currentPath, error, uploading, fileRef, onFileChange, onUpload }: ImageUploadPaneProps) {
  return (
    <div className="space-y-4">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white/[0.02]"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
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
      <Button onClick={onUpload} disabled={!file || uploading} variant="brand" className="w-full">
        {uploading ? 'Uploading...' : 'Upload & Use'}
      </Button>
    </div>
  );
}
