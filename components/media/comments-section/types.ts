import type { Comment, CommentThreads } from '@/types';

export interface CommentsSectionProps {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: CommentThreads;
}

export interface CommentBoxProps {
  comment: Comment;
  slug: string;
  onDelete: () => void;
  onReply: () => void;
}

export interface CommentComposerProps {
  body: string;
  busy: boolean;
  error: string | null;
  replyTo: Comment | null;
  placeholder: string;
  userName: string | null | undefined;
  userAvatar: string | null | undefined;
  userId: number;
  onBody: (s: string) => void;
  onCancelReply: () => void;
  onSubmit: () => void;
}

export interface CommentThreadsProps {
  comments: Comment[];
  slug: string;
  onDelete: () => void;
  onReply: (c: Comment) => void;
}
