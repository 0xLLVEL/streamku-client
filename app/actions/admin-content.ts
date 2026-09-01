'use server';

import { fetchApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

/** Pull the API's error message, falling back to a contextual default. */
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

// -- DELETIONS --

export async function deleteContentAction(id: number | string, type: 'movies' | 'tv-shows' | 'genres' | 'cast') {
  try {
    const res = await fetchApi(`/admin/${type}/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      revalidatePath(`/admin/${type}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, `Failed to delete ${type}`) };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function bulkDeleteContentAction(ids: (number | string)[], type: 'movies' | 'tv-shows' | 'genres' | 'cast') {
  try {
    // In a real app we'd have a true bulk API endpoint, 
    // but here we can just loop over the existing single delete endpoint for simplicity
    // or if the backend supports it, we'd call a bulk endpoint.
    // For now we'll do promise.all
    const promises = ids.map(id => fetchApi(`/admin/${type}/${id}`, { method: 'DELETE' }));
    const results = await Promise.all(promises);

    const allOk = results.every(res => res.ok);

    if (allOk) {
      revalidatePath(`/admin/${type}`);
      return { success: true };
    }

    return { success: false, error: `Failed to delete some ${type}` };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteVideoAction(movieId: number | string, videoId: number | string) {
  try {
    const res = await fetchApi(`/admin/movies/${movieId}/videos/${videoId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      revalidatePath(`/admin/movies/${movieId}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to delete video') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function createEmbedVideoAction(params: {
  mediableId: number | string;
  mediableType: 'movie' | 'tv-show' | 'episode';
  key: string;
  site: string;
  name: string;
}) {
  try {
    const endpoint = params.mediableType === 'movie'
      ? `/admin/movies/${params.mediableId}/videos`
      : params.mediableType === 'episode'
        ? `/admin/episodes/${params.mediableId}/videos`
        : `/admin/tv-shows/${params.mediableId}/videos`;

    const res = await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        key: params.key,
        site: params.site,
        name: params.name,
        official: false,
      }),
    });

    if (res.ok) {
      const revalidatePath_ = params.mediableType === 'movie'
        ? `/admin/movies/${params.mediableId}`
        : params.mediableType === 'episode'
          ? `/admin/episodes/${params.mediableId}`
          : `/admin/tv-shows/${params.mediableId}`;
      revalidatePath(revalidatePath_);
      const data = await res.json();
      return { success: true, data: data.data };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to save embed video') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteEmbedVideoAction(params: {
  mediableId: string | number;
  mediableType: 'movie' | 'tv-show' | 'episode';
  videoId: string | number;
}) {
  try {
    const endpoint = params.mediableType === 'movie'
      ? `/admin/movies/${params.mediableId}/videos/${params.videoId}`
      : params.mediableType === 'episode'
        ? `/admin/episodes/${params.mediableId}/videos/${params.videoId}`
        : `/admin/tv-shows/${params.mediableId}/videos/${params.videoId}`;

    const res = await fetchApi(endpoint, {
      method: 'DELETE',
    });

    if (res.ok) {
      const revalidatePath_ = params.mediableType === 'movie'
        ? `/admin/movies/${params.mediableId}`
        : params.mediableType === 'episode'
          ? `/admin/episodes/${params.mediableId}`
          : `/admin/tv-shows/${params.mediableId}`;
      revalidatePath(revalidatePath_);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to delete stream') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteSeasonAction(tvShowId: number | string, seasonNumber: number | string) {
  try {
    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to delete season') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function bulkGenerateVidkingEpisodesAction(tvShowId: number | string, seasonNumber: number | string, formData: FormData) {
  try {
    const totalEpisodes = Number(formData.get('total_episodes'));
    if (!totalEpisodes || totalEpisodes < 1) return { success: false, error: 'Invalid total episodes' };

    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}/episodes/bulk-vidking`, {
      method: 'POST',
      body: JSON.stringify({ total_episodes: totalEpisodes }),
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to bulk generate episodes') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// -- CREATES --

export async function createMovieAction(formData: FormData) {
  try {
    const payload = {
      title: formData.get('title'),
      overview: formData.get('overview'),
      tagline: formData.get('tagline'),
      release_date: formData.get('release_date') || null,
      status: formData.get('status'),
      trailer_url: formData.get('trailer_url') || null,
      is_featured: formData.get('is_featured') === 'on',
    };

    const res = await fetchApi(`/admin/movies`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath('/admin/movies');
      return { success: true, id: data.data?.id };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to create movie') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function createTvShowAction(formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
      overview: formData.get('overview'),
      tagline: formData.get('tagline'),
      first_air_date: formData.get('first_air_date') || null,
      status: formData.get('status'),
      trailer_url: formData.get('trailer_url') || null,
      is_featured: formData.get('is_featured') === 'on',
    };

    const res = await fetchApi(`/admin/tv-shows`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath('/admin/tv-shows');
      return { success: true, id: data.data?.id };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to create TV show') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// -- IMPORTS --

export async function importMovieFromTmdbAction(tmdbId: string | number) {
  try {
    const res = await fetchApi('/admin/tmdb/import/movie', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: tmdbId }),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath('/admin/movies');
      return { success: true, id: data.data?.id };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to import movie from TMDB') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function importTvShowFromTmdbAction(tmdbId: string | number) {
  try {
    const res = await fetchApi('/admin/tmdb/import/tv', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: tmdbId }),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath('/admin/tv-shows');
      return { success: true, id: data.data?.id };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to import TV show from TMDB') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function searchTmdbAction(query: string, type: 'movie' | 'tv') {
  try {
    const res = await fetchApi(`/admin/tmdb/search?query=${encodeURIComponent(query)}&type=${type}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, results: data.data?.results || [] };
    }
    return { success: false, results: [] };
  } catch {
    return { success: false, results: [] };
  }
}

export async function previewTmdbMovieAction(tmdbId: string | number) {
  try {
    const res = await fetchApi(`/admin/tmdb/movie/${tmdbId}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data };
    }
    return { success: false, error: 'Failed to fetch movie preview from TMDB' };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function previewTmdbTvAction(tmdbId: string | number) {
  try {
    const res = await fetchApi(`/admin/tmdb/tv/${tmdbId}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data };
    }
    return { success: false, error: 'Failed to fetch TV show preview from TMDB' };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// -- UPDATES --

export async function updateMovieAction(id: number | string, formData: FormData) {
  try {
    const payload = {
      title: formData.get('title'),
      overview: formData.get('overview'),
      tagline: formData.get('tagline'),
      release_date: formData.get('release_date') || null,
      status: formData.get('status'),
      trailer_url: formData.get('trailer_url') || null,
      is_featured: formData.get('is_featured') === 'on',
    };

    const res = await fetchApi(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      revalidatePath('/admin/movies');
      revalidatePath(`/admin/movies/${id}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to update movie') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateTvShowAction(id: number | string, formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
      overview: formData.get('overview'),
      tagline: formData.get('tagline'),
      first_air_date: formData.get('first_air_date') || null,
      status: formData.get('status'),
      trailer_url: formData.get('trailer_url') || null,
      is_featured: formData.get('is_featured') === 'on',
    };

    const res = await fetchApi(`/admin/tv-shows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      revalidatePath('/admin/tv-shows');
      revalidatePath(`/admin/tv-shows/${id}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to update TV show') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function createGenreAction(formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
    };

    const res = await fetchApi('/admin/genres', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      revalidatePath('/admin/genres');
      return { success: true as const, id: data?.data?.id ?? data?.id ?? null };
    }

    const data = await res.json();
    return { success: false as const, error: await readError(res, 'Failed to create genre') };
  } catch {
    return { success: false as const, error: 'An unexpected error occurred.' };
  }
}

export async function updateGenreAction(id: number | string, formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
    };

    const res = await fetchApi(`/admin/genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      revalidatePath('/admin/genres');
      revalidatePath(`/admin/genres/${id}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to update genre') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateSeasonAction(tvShowId: number | string, seasonNumber: number | string, formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
      overview: formData.get('overview'),
      air_date: formData.get('air_date') || null,
    };

    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`);
      revalidatePath(`/admin/tv-shows/${tvShowId}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to update season') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateEpisodeAction(tvShowId: number | string, seasonNumber: number | string, episodeNumber: number | string, formData: FormData) {
  try {
    const payload = {
      name: formData.get('name'),
      overview: formData.get('overview'),
      air_date: formData.get('air_date') || null,
      runtime: formData.get('runtime') ? parseInt(formData.get('runtime') as string, 10) : null,
    };

    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}/episodes/${episodeNumber}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}/episodes/${episodeNumber}`);
      revalidatePath(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to update episode') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteMediaAction(mediaId: number | string) {
  try {
    const res = await fetchApi(`/admin/media/${mediaId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: await readError(res, 'Failed to delete media') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
