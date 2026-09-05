'use client';

import { useRouter } from 'next/navigation';
import { deleteModerationEntryAction, setEntryApprovedAction } from '@/app/actions/admin-moderation';
import type { ModerationRow, ModerationTarget } from '../types';

type Refetch = () => unknown;

export function useModerationMutations(target: ModerationTarget, refetch: Refetch) {
  const router = useRouter();

  async function mutate(
    action: () => Promise<{ success: boolean; error?: string }>,
    fallback: string,
  ) {
    const res = await action();
    if (res.success) {
      router.refresh();
      refetch();
    } else {
      alert(res.error ?? fallback);
    }
  }

  async function toggle(r: ModerationRow) {
    await mutate(
      () => setEntryApprovedAction(target, r.id, !r.is_approved),
      'Failed to update status',
    );
  }

  async function remove(r: ModerationRow) {
    await mutate(() => deleteModerationEntryAction(target, r.id), 'Failed to delete');
  }

  return { toggle, remove };
}
