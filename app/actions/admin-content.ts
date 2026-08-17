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
