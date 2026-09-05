'use client';

import type { ReviewBucket } from '@/types';
import { useReviews } from './hooks/use-reviews';
import { ReviewForm } from './ReviewForm';
import { ReviewItem } from './ReviewItem';

interface ReviewsSectionProps {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: ReviewBucket;
}

export function ReviewsSection({ mediaType, mediaId, slug, initial }: ReviewsSectionProps) {
  const { user, bucket, loading, rating, body, error, busy, editing, setRating, setBody, setEditing, canWrite, myReview, avgRating, reviewCount, startEditing, save, remove } = useReviews({ mediaType, mediaId, slug, initial });

  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-14">
      <div className="flex items-baseline gap-3 mb-7">
        <h2 className="text-3xl font-bold text-white tracking-tight">Reviews</h2>
        {reviewCount > 0 && (
          <span className="text-sm font-semibold text-white/40">{reviewCount}</span>
        )}
      </div>

      {reviewCount > 0 && (
        <div className="liquid-glass rounded-2xl p-6 mb-8 flex items-center gap-6">
          <div className="shrink-0 text-center">
            <div className="text-5xl font-black text-white leading-none">
              {Number(avgRating ?? 0).toFixed(1)}
            </div>
            <div className="text-xs text-white/40 mt-1">out of 10</div>
          </div>
          <div className="w-px h-14 bg-white/10" />
          <div>
            <div className="text-2xl text-yellow-500 tracking-wide">
              {'★'.repeat(Math.round(avgRating ?? 0))}
              <span className="text-white/15">{'★'.repeat(10 - (Math.round(avgRating ?? 0)))}</span>
            </div>
            <div className="text-sm text-white/50 mt-1">
              {/* ponytail: aggregate ratings without per-user columns — reuse the count we already have */}
              Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      )}

      {canWrite && myReview == null && (
        <ReviewForm mode="new" rating={rating} body={body} error={error} busy={busy} onRating={setRating} onBody={setBody} onSubmit={save} />
      )}

      {myReview != null && editing && (
        <ReviewForm mode="edit" rating={rating} body={body} error={error} busy={busy} onRating={setRating} onBody={setBody} onCancel={() => setEditing(false)} onSubmit={save} />
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading reviews...</p>
      ) : bucket.reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet{canWrite ? ' — be the first!' : '.'}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {bucket.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} mine={!!user && review.user_id === user.id} showActions={!!user && review.user_id === user.id && myReview != null} busy={busy} onEdit={startEditing} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
