'use server';

import { fetchApi } from '@/lib/api.utils';
import { revalidatePath } from 'next/cache';
import { readError, UNEXPECTED_ERROR } from './_shared';

type ModerationTarget = 'reviews' | 'comments';

export async function setEntryApprovedAction(
  target: ModerationTarget,
  id: number,
  approved: boolean,
) {
  try {
    const res = await fetchApi(`/admin/${target}/${id}/${approved ? 'approve' : 'hide'}`, {
      method: 'POST',
    });

    if (res.ok) {
      revalidatePath(`/admin/${target}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, `Failed to update ${target.slice(0, -1)}`) };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}

export async function deleteModerationEntryAction(target: ModerationTarget, id: number) {
  try {
    const res = await fetchApi(`/admin/${target}/${id}`, { method: 'DELETE' });

    if (res.ok) {
      revalidatePath(`/admin/${target}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, `Failed to delete ${target.slice(0, -1)}`) };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}
