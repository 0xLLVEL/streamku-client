// ponytail: single normalize for admin content rows — normalizeMovie/normalizeTv were 80% identical.

export interface ContentRowInput {
  id: number;
  tmdb_id: number | null;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  views: number;
  genres?: { name: string }[] | null;
  created_at: string;
}

export interface NormalizedContentRow {
  kind: 'movie' | 'tv';
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres: { name: string }[] | null;
  created_at: string;
}

export function normalizeContentRow(row: ContentRowInput, kind: 'movie' | 'tv'): NormalizedContentRow {
  return {
    kind,
    id: row.id,
    tmdb_id: row.tmdb_id,
    title: row.title ?? row.name ?? '',
    poster_path: row.poster_path,
    release_date: row.release_date ?? row.first_air_date ?? null,
    views: row.views,
    genres: row.genres ?? null,
    created_at: row.created_at,
  };
}
