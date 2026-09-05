'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  createMovieAction,
  updateMovieAction,
  importMovieFromTmdbAction,
} from '@/app/actions/admin-content-media';
import { useTitleSave } from '../../use-title-save';
import type { FormMessage, TitleDisplayData } from '../../types';
import { EMPTY_MOVIE } from '../constants';

export function useMovieEditor(movie?: TitleDisplayData) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('primary_facts');
  const [previewData, setPreviewData] = useState<TitleDisplayData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [artworkOverride, setArtworkOverride] = useState<{ poster_path?: string | null; backdrop_path?: string | null }>({});

  const baseDisplayData = previewData ?? movie ?? EMPTY_MOVIE;
  const displayData: TitleDisplayData = {
    ...baseDisplayData,
    poster_path: artworkOverride.poster_path !== undefined ? artworkOverride.poster_path : baseDisplayData.poster_path,
    backdrop_path: artworkOverride.backdrop_path !== undefined ? artworkOverride.backdrop_path : baseDisplayData.backdrop_path,
  };

  const saveMutation = useTitleSave({
    existingId: movie?.id ?? null,
    previewTmdbId: previewData?.tmdb_id ?? null,
    actions: { importFromTmdb: importMovieFromTmdbAction, create: createMovieAction, update: updateMovieAction },
    onSuccess: ({ targetId, createdId }) => {
      setMessage({ text: 'Movie saved successfully!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setTimeout(() => {
        setMessage(null);
        if (!movie?.id && (targetId || createdId)) router.push(`/admin/movies/${targetId ?? createdId}`);
      }, 2000);
    },
    onError: (error) => setMessage({ text: error, type: 'error' }),
  });

  const applyArtwork = (kind: 'poster_path' | 'backdrop_path', path: string | null) => {
    setArtworkOverride((prev) => ({ ...prev, [kind]: path }));
    if (previewData) setPreviewData((prev) => (prev ? { ...prev, [kind]: path } : prev));
  };

  return {
    activeTab, setActiveTab, previewData, setPreviewData, previewImage, setPreviewImage,
    message, setMessage, displayData, saveMutation,
    handlePosterSelect: (path: string) => applyArtwork('poster_path', path),
    handleBackdropSelect: (path: string) => applyArtwork('backdrop_path', path),
    handleClearPoster: () => {
      setArtworkOverride((prev) => ({ ...prev, poster_path: '' }));
      if (previewData) setPreviewData((prev) => (prev ? { ...prev, poster_path: null } : prev));
    },
    handleClearBackdrop: () => {
      setArtworkOverride((prev) => ({ ...prev, backdrop_path: '' }));
      if (previewData) setPreviewData((prev) => (prev ? { ...prev, backdrop_path: null } : prev));
    },
  };
}
