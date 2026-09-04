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

// -- EMBED VIDEOS --

export async function createEmbedVideoAction(params: {
  mediableId: number | string;
  mediableType: 'movie' | 'tv-show' | 'episode';
  key: string;
  site: string;
  name: string;
  /** Required when mediableType is 'episode'. */
  tvShowId?: number | string;
  seasonNumber?: number | string;
}) {
  try {
    const endpoint = params.mediableType === 'movie'
      ? `/admin/movies/${params.mediableId}/videos`
      : params.mediableType === 'episode'
        ? `/admin/tv-shows/${params.tvShowId}/seasons/${params.seasonNumber}/episodes/${params.mediableId}/videos`
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

    return { success: false, error: await readError(res, 'Failed to save embed video') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteEmbedVideoAction(params: {
  mediableId: string | number;
  mediableType: 'movie' | 'tv-show' | 'episode';
  videoId: string | number;
  /** Required when mediableType is 'episode'. */
  tvShowId?: number | string;
  seasonNumber?: number | string;
}) {
  try {
    const endpoint = params.mediableType === 'movie'
      ? `/admin/movies/${params.mediableId}/videos/${params.videoId}`
      : params.mediableType === 'episode'
        ? `/admin/tv-shows/${params.tvShowId}/seasons/${params.seasonNumber}/episodes/${params.mediableId}/videos/${params.videoId}`
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

// -- SEASONS & EPISODES --

export async function deleteSeasonAction(tvShowId: number | string, seasonNumber: number | string) {
  try {
    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to delete season') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function bulkGenerateVidkingEpisodesAction(tvShowId: number | string, seasonNumber: number | string, formData: FormData) {
  try {
    const totalEpisodes = Number(formData.get('total_episodes'));
    if (!totalEpisodes || totalEpisodes < 1) return { success: false, error: 'Invalid total episodes' };
    const site = String(formData.get('site') || 'VidKing');

    const res = await fetchApi(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}/episodes/bulk-embed`, {
      method: 'POST',
      body: JSON.stringify({ total_episodes: totalEpisodes, site }),
    });

    if (res.ok) {
      revalidatePath(`/admin/tv-shows/${tvShowId}/seasons/${seasonNumber}`);
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to bulk generate episodes') };
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

    return { success: false, error: await readError(res, 'Failed to update episode') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// -- MEDIA --

export async function deleteMediaAction(mediaId: number | string) {
  try {
    const res = await fetchApi(`/admin/media/${mediaId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      return { success: true };
    }

    return { success: false, error: await readError(res, 'Failed to delete media') };
  } catch {
    return { success: false, error: 'An unexpected error occurred.' };
  }
}