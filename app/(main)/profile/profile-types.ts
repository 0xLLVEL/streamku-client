export interface ProfileUser {
  name: string;
  email: string;
}

export interface MediaListItem {
  id: number;
  media_type?: string;
  media_details?: {
    slug?: string;
    title?: string | null;
    poster_path?: string | null;
  } | null;
}
