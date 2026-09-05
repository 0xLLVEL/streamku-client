'use client';

import { apiFetch } from '@/lib/api-client.utils';
import type { AdminResourcePage } from '@/components/admin/lists/AdminResourceList';
import type { ContentRow } from './constants';

export async function fetchKind(
  endpoint: 'movies' | 'tv-shows',
  page: number,
  perPage: number,
  search: string,
  filters: Record<string, string>,
  sort: string,
  direction: 'asc' | 'desc',
): Promise<AdminResourcePage<ContentRow>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort,
    direction,
  });
  if (search) params.append('search', search);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.append(key, value);
  }

  const res = await apiFetch(`/admin/${endpoint}?${params.toString()}`);
  if (!res.ok) return { data: [], last_page: 1 };

  const payload = await res.json();
  const apiRows: unknown[] = Array.isArray(payload?.data) ? payload.data : [];

  const data = apiRows
    .map((raw) => normalizeRow(endpoint, raw))
    .filter((row): row is ContentRow => row !== null);

  return { data, last_page: Number(payload?.last_page) || 1 };
}

function normalizeRow(endpoint: 'movies' | 'tv-shows', raw: unknown): ContentRow | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  if (!Number.isFinite(id)) return null;

  return {
    kind: endpoint === 'movies' ? 'movie' : 'tv',
    id,
    tmdb_id: record.tmdb_id != null ? Number(record.tmdb_id) : null,
    title: String(record.title ?? record.name ?? 'Untitled'),
    poster_path: typeof record.poster_path === 'string' ? record.poster_path : null,
    release_date: typeof (record.release_date ?? record.first_air_date) === 'string'
      ? (record.release_date ?? record.first_air_date) as string
      : null,
    views: Number(record.views ?? 0),
    genres: Array.isArray(record.genres)
      ? (record.genres as { name: string }[])
      : null,
    created_at: typeof record.created_at === 'string' ? record.created_at : '',
  };
}
