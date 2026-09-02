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

/** Fetch the review bucket (avg, count, my_review, approved list). User-specific, uncached. */
export async function getReviewBucket(
  mediaType: 'movie' | 'tv_show',
  mediaId: number,
): Promise<ReviewBucket> {
  const res = await fetchApi(`/reviews/${mediaType}/${mediaId}`, { cache: 'no-store' });
  if (!res.ok) {
    return { ...EMPTY_REVIEWS, media_type: mediaType, media_id: mediaId };
  }
  const json = await res.json();
  return json?.data
    ? { ...json.data, media_type: mediaType, media_id: mediaId }
    : { ...EMPTY_REVIEWS, media_type: mediaType, media_id: mediaId };
}

/** Fetch approved comment threads for a title. User-specific (mine), uncached. */
export async function getCommentThreads(
  mediaType: 'movie' | 'tv_show',
  mediaId: number,
): Promise<CommentThreads> {
  const res = await fetchApi(`/comments/${mediaType}/${mediaId}`, { cache: 'no-store' });
  if (!res.ok) {
    return { ...EMPTY_COMMENTS, media_type: mediaType, media_id: mediaId };
  }
  const json = await res.json();
  return json?.data
    ? { ...json.data, media_type: mediaType, media_id: mediaId }
    : { ...EMPTY_COMMENTS, media_type: mediaType, media_id: mediaId };
}
