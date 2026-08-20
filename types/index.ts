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
  metadata?: any;
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

export interface Movie {
  id: number;
  tmdb_id: number;
  title?: string;
  name?: string;
  slug: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
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
  videos?: Video[];
  history?: {
    progress_seconds: number;
    duration_seconds: number;
    completed: boolean;
  };
}

export interface TvShow {
  id: number;
  tmdb_id: number;
  name?: string;
  title?: string;
  slug: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  release_date?: string;
  last_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  status?: string;
  is_featured?: boolean;
  episode_run_time?: number[];
  runtime?: number;
  number_of_seasons?: number;
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
  seasons?: Season[];
}

export type MediaItem = Movie | TvShow;

export interface BrowseRow {
  title: string;
  items: MediaItem[];
}
