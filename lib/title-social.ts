import { fetchApi } from '@/lib/api';
import { ReviewBucket, CommentThreads } from '@/types';

const EMPTY_REVIEWS: Omit<ReviewBucket, 'media_id'> = {
  media_type: 'reviews',
  avg_rating: null,
  review_count: 0,
  my_review: null,
  reviews: [],
};

const EMPTY_COMMENTS: Omit<CommentThreads, 'media_id'> = {
  media_type: 'comments',
  total: 0,
  comments: [],
};

async function fetchBucket<T>(path: string, empty: Omit<T, 'media_id'>, mediaType: string, mediaId: number): Promise<T> {
  const res = await fetchApi(path, { cache: 'no-store' });
  if (!res.ok) return { ...empty, media_type: mediaType, media_id: mediaId } as T;
  const json = await res.json();
  return json?.data ? { ...json.data, media_type: mediaType, media_id: mediaId } as T : { ...empty, media_type: mediaType, media_id: mediaId } as T;
}

export function getReviewBucket(mediaType: 'movie' | 'tv_show', mediaId: number): Promise<ReviewBucket> {
  return fetchBucket<ReviewBucket>(`/reviews/${mediaType}/${mediaId}`, EMPTY_REVIEWS, mediaType, mediaId);
}

export function getCommentThreads(mediaType: 'movie' | 'tv_show', mediaId: number): Promise<CommentThreads> {
  return fetchBucket<CommentThreads>(`/comments/${mediaType}/${mediaId}`, EMPTY_COMMENTS, mediaType, mediaId);
}
