'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSeasonAction } from '@/app/actions/admin-content-embeds';

export function useDeleteSeason(tvShowId: number | null | undefined) {
  const router = useRouter();
  const [deletingSeasonNumber, setDeletingSeasonNumber] = useState<number | string | null>(null);

  const handleDeleteSeason = async (seasonNumber: number | string) => {
    if (!tvShowId) return;
    if (!confirm('Are you sure you want to completely delete this season and all its episodes? This action cannot be undone.')) return;
    setDeletingSeasonNumber(seasonNumber);
    const res = await deleteSeasonAction(tvShowId, seasonNumber);
    if (res.success) router.refresh();
    else alert(res.error || 'Failed to delete season');
    setDeletingSeasonNumber(null);
  };

  return { deletingSeasonNumber, handleDeleteSeason };
}
