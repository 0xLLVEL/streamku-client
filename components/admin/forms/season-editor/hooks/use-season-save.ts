'use client';

import { useState } from 'react';
import { updateSeasonAction } from '@/app/actions/admin-content-embeds';
import type { SeasonFormMessage } from '../types';

export function useSeasonSave(tvShowId: number | string, seasonNumber: number) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<SeasonFormMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateSeasonAction(tvShowId, seasonNumber, formData);
    if (res.success) {
      setMessage({ text: 'Season updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: res.error || 'Failed to update', type: 'error' });
    }
    setIsSaving(false);
  };

  return { isSaving, message, handleSubmit };
}
