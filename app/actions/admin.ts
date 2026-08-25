'use server';

import { fetchApi } from '@/lib/api';

export async function importTmdbAction(tmdbId: number, type: 'movie' | 'tv') {
  try {
    const endpoint = type === 'movie' ? '/admin/tmdb/import/movie' : '/admin/tmdb/import/tv';
    
    const res = await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: tmdbId })
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to import content' };
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred during import.' };
  }
}
