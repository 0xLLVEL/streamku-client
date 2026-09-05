export interface EpisodeMediaEntry {
  id: number;
  type?: string;
  name?: string | null;
  original_filename?: string | null;
  created_at?: string | null;
  quality?: { id: number; name?: string } | null;
  metadata?: { label?: string } & Record<string, unknown>;
}

export interface EpisodeEmbedVideo {
  id: number;
  site: string;
  key: string;
  name?: string | null;
}

export interface EpisodeEditData {
  id: number;
  episode_number: number;
  name?: string | null;
  overview?: string | null;
  still_path?: string | null;
  air_date?: string | null;
  runtime?: number | null;
  season?: { tv_show?: { tmdb_id?: number | null } | null } | null;
  media?: EpisodeMediaEntry[];
  videos?: EpisodeEmbedVideo[];
}

export interface EpisodeFormMessage {
  text: string;
  type: 'success' | 'error';
}
