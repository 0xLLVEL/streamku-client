'use client';

import { useRef, useState } from 'react';
import { uploadImageAction } from '@/app/actions/admin-content-media';

export function useImageUpload(type: 'poster' | 'backdrop', onSelect: (path: string) => void, onClose: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
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

  return { file, preview, uploading, error, fileRef, handleFileChange, handleUpload };
}
