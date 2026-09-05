export interface Genre {
  id: number;
  tmdb_id: number;
  name: string;
  slug: string;
}

export interface Video {
  id: number;
  site: string;
  key: string;
  name: string;
  resolution?: string;
  language?: string;
  metadata?: {
    content_type?: string;
    [key: string]: unknown;
  } | null;
}

export interface Cast {
  id: number;
  tmdb_id: number;
  name: string;
  original_name: string;
  profile_path?: string;
  character: string;
  order: number;
}

export interface Episode {
  id: number;
  season_id: number;
  tmdb_id: number;
  name: string;
  episode_number: number;
  season_number?: number;
  overview?: string;
  still_path?: string;
  air_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
  videos?: Video[];
  history?: {
    progress_seconds: number;
    duration_seconds: number;
    completed: boolean;
  };
}

export interface Season {
  id: number;
  tv_show_id: number;
  tmdb_id: number;
  name: string;
  season_number: number;
  overview?: string;
  poster_path?: string;
  air_date?: string;
  episode_count?: number;
  episodes?: Episode[];
}

/** Shared core for Movie/TvShow — the two overlapped ~90%. */
export interface TitleCore {
  id: number;
  tmdb_id: number;
  slug: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  status?: string;
  is_featured?: boolean;
  trailer_url?: string;
  original_language?: string;
  tagline?: string;
  images?: {
    logos?: { file_path: string }[];
    backdrops?: { file_path: string }[];
    posters?: { file_path: string }[];
  };
  genres?: Genre[];
  cast?: Cast[];
  history?: {
    progress_seconds: number;
    duration_seconds: number;
    completed: boolean;
  };
}

export interface Movie extends TitleCore {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  videos?: Video[];
}

export interface TvShow extends TitleCore {
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  last_air_date?: string;
  episode_run_time?: number[];
  runtime?: number;
  number_of_seasons?: number;
  seasons?: Season[];
}

export type MediaItem = Movie | TvShow;

export interface BrowseRow {
  title: string;
  items: MediaItem[];
}
