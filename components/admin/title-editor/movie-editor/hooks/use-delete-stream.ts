'use client';

import { useRouter } from 'next/navigation';
import { deleteEmbedVideoAction } from '@/app/actions/admin-content-embeds';
import type { FormMessage } from '../../types';

export function useDeleteStream(movieId: number | null | undefined, setMessage: (m: FormMessage | null) => void) {
  const router = useRouter();
  const handleDeleteEmbedVideo = async (videoId: string | number) => {
    if (!movieId || !confirm('Are you sure you want to delete this stream?')) return;
    const res = await deleteEmbedVideoAction({ mediableId: movieId, mediableType: 'movie', videoId });
    if (res.success) {
      setMessage({ text: 'Stream deleted successfully', type: 'success' });
      router.refresh();
    } else {
      setMessage({ text: res.error || 'Failed to delete stream', type: 'error' });
    }
  };
  return { handleDeleteEmbedVideo };
}
