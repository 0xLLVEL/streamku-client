export interface ProfileUser {
  name?: string;
  username: string;
  email: string;
  avatar?: string | null;
  nickname?: string | null;
  created_at?: string | null;
  is_admin?: boolean;
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
