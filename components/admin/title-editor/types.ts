import type { ReactNode } from 'react';

/** Transient save/import feedback shown in the sticky header. */
export interface FormMessage {
  text: string;
  type: 'success' | 'error';
}

export interface EditFormTab {
  id: string;
  label: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string | null;
  profile_path?: string | null;
}

export interface TitleImageSet {
  backdrops?: { id?: number; file_path: string }[];
  posters?: { id?: number; file_path: string }[];
}

/** Uploaded (Tus) media entry attached to a title. */
export interface UploadedMediaEntry {
  id: number;
  type?: string;
  name?: string | null;
  original_filename?: string | null;
  created_at?: string | null;
  quality?: { id: number; name?: string } | null;
  metadata?: { label?: string } & Record<string, unknown>;
}

/** External embeddable stream (VidKing, YouTube, ...). */
export interface EmbedVideoEntry {
  id: number;
  site: string;
  key: string;
  name?: string | null;
}

export interface SeasonEntry {
  id: number;
  season_number: number;
  name: string;
  poster_path?: string | null;
  air_date?: string | null;
  episode_count?: number | null;
}

/**
 * Everything the tabs render. Both API payloads and TMDB previews are
 * normalized into this shape before being displayed.
 */
export interface TitleDisplayData {
  id: number | null;
  tmdb_id?: number | null;
  title?: string | null;
  name?: string | null;
  original_title?: string | null;
  overview?: string | null;
  tagline?: string | null;
  trailer_url?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: number | null;
  number_of_seasons?: number | null;
  popularity?: number | null;
  original_language?: string | null;
  status?: string | null;
  slug?: string | null;
  is_featured?: boolean;
  genres?: { id: number; name: string }[] | null;
  cast?: TmdbCastMember[] | null;
  images?: TitleImageSet | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media?: UploadedMediaEntry[];
  videos?: EmbedVideoEntry[];
  seasons?: SeasonEntry[];
}

export interface EditFormShellProps {
  heading: string;
  backHref: string;
  /** Public URL to preview the title on the site (omitted while creating). */
  viewHref?: string;
  tabs: EditFormTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  message: FormMessage | null;
  isSaving: boolean;
  onSubmit: (formData: FormData) => void;
  /**
   * Changing this key remounts tab content so uncontrolled inputs pick up
   * freshly imported TMDB values.
   */
  contentKey: string;
  children: ReactNode;
}
