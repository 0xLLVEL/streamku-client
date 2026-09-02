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
    return { success: false, error: 'An unexpected error occurred.' };
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
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
