'use server';

import { fetchApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

// -- DELETIONS --

export async function deleteContentAction(id: number | string, type: 'movies' | 'tv-shows' | 'genres') {
  try {
    const res = await fetchApi(`/admin/${type}/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      revalidatePath(`/admin/${type}`);
      return { success: true };
    }

    const data = await res.json();
    return { success: false, error: data.message || `Failed to delete ${type}` };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to delete video' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to create movie' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to create TV show' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to import movie from TMDB' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to import TV show from TMDB' };
  } catch (err) {
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
  } catch (err) {
    return { success: false, results: [] };
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
    return { success: false, error: data.message || 'Failed to update movie' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to update TV show' };
  } catch (err) {
    return { success: false, error: 'An unexpected error occurred.' };
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
    return { success: false, error: data.message || 'Failed to update genre' };
  } catch (err) {
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
    return { success: false, error: data.message || 'Failed to update season' };
  } catch (err) {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
