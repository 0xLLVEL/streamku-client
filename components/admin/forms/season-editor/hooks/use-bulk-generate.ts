'use client';

import { useState } from 'react';
import { bulkGenerateVidkingEpisodesAction } from '@/app/actions/admin-content-embeds';
import type { StreamProvider } from '@/lib/config.utils';
import type { SeasonFormMessage } from '../types';

export function useBulkGenerate(tvShowId: number | string, seasonNumber: number, initialCount: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(initialCount);
  const [bulkSite, setBulkSite] = useState<StreamProvider>('VidKing');
  const [generateMessage, setGenerateMessage] = useState<SeasonFormMessage | null>(null);

  const handleBulkGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    const num = parseInt(totalEpisodes);
    if (!num || num < 1) return;
    setIsGenerating(true);
    setGenerateMessage(null);
    const formData = new FormData();
    formData.append('total_episodes', num.toString());
    formData.append('site', bulkSite);
    const res = await bulkGenerateVidkingEpisodesAction(tvShowId, seasonNumber, formData);
    if (res.success) {
      setGenerateMessage({ text: 'Episodes generated successfully!', type: 'success' });
      setTimeout(() => setGenerateMessage(null), 3000);
    } else {
      setGenerateMessage({ text: res.error || 'Failed to generate', type: 'error' });
    }
    setIsGenerating(false);
  };

  return { isGenerating, totalEpisodes, setTotalEpisodes, bulkSite, setBulkSite, generateMessage, handleBulkGenerate };
}
