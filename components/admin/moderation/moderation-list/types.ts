export type ModerationTarget = 'reviews' | 'comments';

export type ModerationFilter = 'all' | 'approved' | 'hidden';

export interface ModerationRow {
  id: number;
  user_id: number;
  user_name: string | null;
  media_type: string;
  media_id: number;
  media_title: string | null;
  body: string | null;
  rating?: number;
  is_approved: boolean;
  created_at: string | null;
}

export interface ModerationPageResponse {
  data?: ModerationRow[];
  meta?: { current_page?: number; last_page?: number; total?: number };
}

export interface ModerationClientProps {
  target: ModerationTarget;
  title: string;
  description: string;
  showRating?: boolean;
}
