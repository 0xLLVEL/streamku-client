import { useState, useRef } from 'react';
import * as tus from 'tus-js-client';
import { getAuthTokenAction } from '@/app/actions/auth';
import { API_BASE_URL } from '@/lib/config';

export type UploadStatus = 'idle' | 'uploading' | 'paused' | 'processing' | 'completed' | 'error';

interface UseTusUploadOptions {
  endpoint?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useTusUpload({ endpoint = '/admin/tus', onSuccess, onError }: UseTusUploadOptions = {}) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const uploadRef = useRef<tus.Upload | null>(null);

  const startUpload = async (file: File, metadata: Record<string, string>) => {
    if (status === 'paused' && uploadRef.current) {
      uploadRef.current.start();
      setStatus('uploading');
      setMessage('Resuming upload...');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setMessage('Initiating upload...');

    try {
      const token = await getAuthTokenAction();
      if (!token) throw new Error('Authentication required');

      const upload = new tus.Upload(file, {
        endpoint: `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
        chunkSize: 50 * 1024 * 1024, // 50MB chunks
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        metadata: {
          ...metadata,
          name: file.name,
          filename: file.name,
          extension: file.name.split('.').pop() || 'mp4',
          filetype: file.type || 'video/mp4',
          size: file.size.toString(),
        },
        onError: function (error) {
          console.error('TUS Error:', error);
          setStatus('error');
          setMessage('Failed because: ' + error);
          if (onError) onError(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          setProgress(percentage);
          
          const uploadedMB = (bytesUploaded / (1024 * 1024)).toFixed(2);
          const totalMB = (bytesTotal / (1024 * 1024)).toFixed(2);
          setMessage(`Uploading ${uploadedMB} MB / ${totalMB} MB...`);
        },
        onSuccess: function () {
          setStatus('completed');
          setMessage('Upload complete!');
          uploadRef.current = null;
          if (onSuccess) onSuccess();
        },
      });

      uploadRef.current = upload;
      upload.start();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred during upload.');
      console.error(err);
      setStatus('error');
      setMessage(error.message);
      if (onError) onError(error);
    }
  };

  const pauseUpload = () => {
    if (uploadRef.current && status === 'uploading') {
      uploadRef.current.abort();
      setStatus('paused');
      setMessage('Upload paused');
    }
  };

  const resumeUpload = () => {
    if (uploadRef.current && status === 'paused') {
      uploadRef.current.start();
      setStatus('uploading');
      setMessage('Resuming upload...');
    }
  };

  const resetUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    uploadRef.current = null;
    setStatus('idle');
    setProgress(0);
    setMessage('');
  };

  return {
    status,
    progress,
    message,
    startUpload,
    pauseUpload,
    resumeUpload,
    resetUpload,
    setStatus,
    setMessage
  };
}
