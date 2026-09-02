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

export async function submitCommentAction(input: {
  mediaId: number;
  mediaType: 'movie' | 'tv_show';
  slug: string;
  body: string;
  parentId?: number;
  existingId?: number;
}) {
  try {
    const res = await fetchApi(
      input.existingId ? `/comments/${input.existingId}` : '/comments',
      {
        method: input.existingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          media_id: input.mediaId,
          media_type: input.mediaType,
          body: input.body,
          parent_id: input.parentId ?? null,
        }),
      },
    );

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to save comment') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteCommentAction(input: {
  id: number;
  slug: string;
}) {
  try {
    const res = await fetchApi(`/comments/${input.id}`, { method: 'DELETE' });

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to delete comment') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
