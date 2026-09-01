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

// -- MOVIES & TV SHOWS --

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

// -- TMDB IMPORT / SEARCH --

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