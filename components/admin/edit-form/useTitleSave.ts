'use client';

import { useMutation } from '@tanstack/react-query';

export interface TitleActionResult {
  success: boolean;
  id?: number;
  error?: string;
}

export interface TitleSaveActions {
  /** Import a TMDB preview into the database before first save. */
  importFromTmdb: (tmdbId: number | string) => Promise<TitleActionResult>;
  create: (formData: FormData) => Promise<TitleActionResult>;
  update: (id: number | string, formData: FormData) => Promise<TitleActionResult>;
}

interface UseTitleSaveOptions {
  /** Database id when editing an existing title. */
  existingId?: number | null;
  /** TMDB id of the currently loaded preview (create-from-import flow). */
  previewTmdbId?: number | null;
  actions: TitleSaveActions;
  onSuccess: (result: { targetId: number | null; createdId?: number }) => void;
  onError: (message: string) => void;
}

/**
 * Shared save pipeline for title forms:
 * optionally import from TMDB, then create or update.
 */
export function useTitleSave({
  existingId = null,
  previewTmdbId = null,
  actions,
  onSuccess,
  onError,
}: UseTitleSaveOptions) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      let targetId = existingId;

      if (!targetId && previewTmdbId) {
        const importResult = await actions.importFromTmdb(previewTmdbId);
        if (!importResult.success) {
          throw new Error(importResult.error || 'Failed to import TMDB data');
        }
        targetId = importResult.id ?? null;
      }

      const result = targetId
        ? await actions.update(targetId, formData)
        : await actions.create(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      return { targetId, createdId: result.id };
    },
    onSuccess,
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    },
  });
}
