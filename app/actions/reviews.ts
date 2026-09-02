'use server';

import { fetchApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function submitReviewAction(input: {
  mediaId: number;
  mediaType: 'movie' | 'tv_show';
  slug: string;
  rating: number;
  body: string;
  existingId?: number;
}) {
  try {
    const res = await fetchApi(
      input.existingId ? `/reviews/${input.existingId}` : '/reviews',
      {
        method: input.existingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          media_id: input.mediaId,
          media_type: input.mediaType,
          rating: input.rating,
          body: input.body,
        }),
      },
    );

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      const data = await res.json();
      return { success: true, review: data?.data ?? null };
    }

    return { success: false, error: await readError(res, 'Failed to save review') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteReviewAction(input: {
  id: number;
  slug: string;
}) {
  try {
    const res = await fetchApi(`/reviews/${input.id}`, { method: 'DELETE' });

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to delete review') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
