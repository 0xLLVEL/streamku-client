'use server';

import { fetchApi } from '@/lib/api.utils';
import { revalidatePath } from 'next/cache';
import { readError, UNEXPECTED_ERROR } from './_shared';

// ponytail: submit/delete for comments vs reviews were near-identical — one generic helper.

type SocialTarget = 'comments' | 'reviews';

interface SocialInput {
  mediaId: number;
  mediaType: 'movie' | 'tv_show';
  slug: string;
  body: string;
  parentId?: number;
  rating?: number;
  existingId?: number;
}

export async function mutateSocialEntry(target: SocialTarget, input: SocialInput) {
  const noun = target === 'comments' ? 'comment' : 'review';
  try {
    const res = await fetchApi(input.existingId ? `/${target}/${input.existingId}` : `/${target}`, {
      method: input.existingId ? 'PUT' : 'POST',
      body: JSON.stringify({
        media_id: input.mediaId,
        media_type: input.mediaType,
        body: input.body,
        ...(input.parentId !== undefined ? { parent_id: input.parentId ?? null } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
      }),
    });

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      if (target === 'reviews' && !input.existingId) {
        const data = await res.json();
        return { success: true, review: data?.data ?? null };
      }
      return { success: true };
    }

    return { success: false, error: await readError(res, `Failed to save ${noun}`) };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}

export async function deleteSocialEntry(target: SocialTarget, input: { id: number; slug: string }) {
  const noun = target === 'comments' ? 'comment' : 'review';
  try {
    const res = await fetchApi(`/${target}/${input.id}`, { method: 'DELETE' });

    if (res.ok) {
      revalidatePath(`/movie/${input.slug}`);
      revalidatePath(`/tv/${input.slug}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, `Failed to delete ${noun}`) };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}
