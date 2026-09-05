'use client';

import { previewTmdbTvAction } from '@/app/actions/admin-content-media';
import type { FormMessage, TitleDisplayData } from '../../types';
import { extractTrailerUrl } from '../../movie-editor/utils/extract-trailer';

interface TmdbImportHandlers {
  setPreviewData: (data: TitleDisplayData | null) => void;
  setMessage: (message: FormMessage | null) => void;
}

export function useTmdbImport({ setPreviewData, setMessage }: TmdbImportHandlers) {
  const handleTmdbImport = async (tmdbId: string) => {
    if (!tmdbId) return;
    setMessage(null);
    const res = await previewTmdbTvAction(tmdbId);
    if (!res.success || !res.data) {
      setMessage({ text: res.error || 'Failed to import preview', type: 'error' });
      return;
    }
    const data = res.data;
    setPreviewData({
      id: null,
      tmdb_id: data.id,
      name: data.name,
      overview: data.overview,
      tagline: data.tagline,
      trailer_url: extractTrailerUrl(data.videos?.results),
      first_air_date: data.first_air_date,
      number_of_seasons: data.number_of_seasons,
      popularity: data.popularity,
      original_language: data.original_language,
      status: data.status,
      genres: data.genres,
      cast: data.credits?.cast ?? [],
      images: data.images,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      seasons: data.seasons ?? [],
    });
    setMessage({ text: 'TV Show data loaded for preview. Review fields and click Save.', type: 'success' });
  };

  return { handleTmdbImport };
}
