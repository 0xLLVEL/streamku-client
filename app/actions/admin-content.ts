'use server';

import { fetchApi } from '@/lib/api.utils';
import { revalidatePath } from 'next/cache';
import { readError, UNEXPECTED_ERROR } from './_shared';

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
    return { success: false, error: UNEXPECTED_ERROR };
  }
}

export async function bulkDeleteContentAction(ids: (number | string)[], type: 'movies' | 'tv-shows' | 'genres' | 'cast') {
  try {
    // ponytail: no bulk endpoint, loop the single-delete endpoint. Swap for a real bulk
    // endpoint when the backend ships one.
    const promises = ids.map(id => fetchApi(`/admin/${type}/${id}`, { method: 'DELETE' }));
    const results = await Promise.all(promises);

    const allOk = results.every(res => res.ok);

    if (allOk) {
      revalidatePath(`/admin/${type}`);
      return { success: true };
    }

    return { success: false, error: `Failed to delete some ${type}` };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}

// -- GENRES --

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

    return { success: false as const, error: await readError(res, 'Failed to create genre') };
  } catch {
    return { success: false as const, error: UNEXPECTED_ERROR };
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

    return { success: false, error: await readError(res, 'Failed to update genre') };
  } catch {
    return { success: false, error: UNEXPECTED_ERROR };
  }
}