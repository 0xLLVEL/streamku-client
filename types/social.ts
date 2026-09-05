export interface Review {
  id: number;
  user_id: number;
  media_type: string;
  media_id: number;
  rating: number;
  body: string | null;
  user_name?: string | null;
  user_avatar?: string | null;
  user_nickname?: string | null;
  created_at?: string | null;
  is_approved?: boolean;
}

export interface ReviewBucket {
  media_type: string;
  media_id: number;
  avg_rating: number | null;
  review_count: number;
  my_review: Review | null;
  reviews: Review[];
}

export interface Comment {
  id: number;
  user_id: number;
  media_type: string;
  media_id: number;
  body: string;
  parent_id?: number | null;
  user_name?: string | null;
  user_avatar?: string | null;
  user_nickname?: string | null;
  created_at?: string | null;
  is_approved?: boolean;
  replies?: Comment[];
}

export interface CommentThreads {
  media_type: string;
  media_id: number;
  total: number;
  comments: Comment[];
}
