'use client';

import { previewTmdbMovieAction } from '@/app/actions/admin-content-media';
import type { FormMessage, TitleDisplayData } from '../../types';
import { extractTrailerUrl } from '../utils/extract-trailer';

interface TmdbImportHandlers {
  setPreviewData: (data: TitleDisplayData | null) => void;
  setMessage: (message: FormMessage | null) => void;
}

export function useTmdbImport({ setPreviewData, setMessage }: TmdbImportHandlers) {
  const handleTmdbImport = async (tmdbId: string) => {
    if (!tmdbId) return;
    setMessage(null);
    const res = await previewTmdbMovieAction(tmdbId);
    if (!res.success || !res.data) {
      setMessage({ text: res.error || 'Failed to import preview', type: 'error' });
      return;
    }
    const data = res.data;
    setPreviewData({
      id: null,
      tmdb_id: data.id,
      title: data.title,
      overview: data.overview,
      tagline: data.tagline,
      trailer_url: extractTrailerUrl(data.videos?.results),
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      original_language: data.original_language,
      status: data.status,
      genres: data.genres,
      cast: data.credits?.cast ?? [],
      images: data.images,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
    });
    setMessage({ text: 'Movie data loaded for preview. Review fields and click Save.', type: 'success' });
  };

  return { handleTmdbImport };
}
