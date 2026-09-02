'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { submitReviewAction, deleteReviewAction } from '@/app/actions/reviews';
import { apiFetch } from '@/lib/apiClient';
import { ReviewBucket, Review } from '@/types';
import { UserAvatar } from '@/components/media/UserAvatar';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500 text-sm tracking-wide" aria-label={`${rating} out of 10`}>
      {'★'.repeat(rating)}
      <span className="text-white/20">{'★'.repeat(10 - rating)}</span>
    </span>
  );
}

export function ReviewsSection({
  mediaType,
  mediaId,
  slug,
  initial,
}: {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: ReviewBucket;
}) {
  const { user } = useAuth();
  const [bucket, setBucket] = useState<ReviewBucket>(
    initial ?? {
      media_type: mediaType,
      media_id: mediaId,
      avg_rating: null,
      review_count: 0,
      my_review: null,
      reviews: [],
    },
  );
  const [loading, setLoading] = useState(!initial);
  const [rating, setRating] = useState(initial?.my_review?.rating ?? 5);
  const [body, setBody] = useState(initial?.my_review?.body ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    (async () => {
      try {
        let res: Response;
        try {
          res = await apiFetch(`/reviews/${mediaType}/${mediaId}`);
        } catch {
          res = await apiFetch(`/reviews/${mediaType}/${mediaId}`, { requireAuth: false });
        }
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json?.data && !cancelled) {
          setBucket({ ...json.data, media_type: mediaType, media_id: mediaId });
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaType, mediaId, initial]);

  const canWrite = !!user;
  const myReview = bucket.my_review;

  const avgRating = useMemo(() => {
    if (bucket.reviews.length === 0) return null;
    const total = bucket.reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / bucket.reviews.length;
  }, [bucket.reviews]);

  function startEditing() {
    if (!myReview) return;
    setRating(myReview.rating);
    setBody(myReview.body ?? '');
    setError(null);
    setEditing(true);
  }

  function startNew() {
    setRating(5);
    setBody('');
    setError(null);
    setEditing(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await submitReviewAction({
      mediaId,
      mediaType,
      slug,
      rating,
      body,
      existingId: myReview?.id,
    });
    setBusy(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to save review.');
      return;
    }

    const saved: Review = res.review ?? {
      id: myReview?.id ?? Date.now(),
      user_id: user?.id ?? 0,
      media_type: mediaType,
      media_id: mediaId,
      rating,
      body,
      user_name: user?.name ?? null,
      is_approved: true,
    };

    setBucket((prev) => {
      const exists = prev.my_review != null;
      const reviews = exists
        ? prev.reviews.map((r) => (r.id === prev.my_review?.id ? saved : r))
        : [...prev.reviews, saved];

      return { ...prev, my_review: saved, reviews };
    });
    setEditing(false);
  }

  async function remove() {
    if (!myReview) return;
    setBusy(true);
    setError(null);
    const res = await deleteReviewAction({ id: myReview.id, slug });
    setBusy(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to delete review.');
      return;
    }

    setBucket((prev) => ({
      ...prev,
      my_review: null,
      reviews: prev.reviews.filter((r) => r.id !== myReview.id),
    }));
    setEditing(false);
    startNew();
  }

  const reviewCount = bucket.reviews.length;

  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-14">
      <div className="flex items-baseline gap-3 mb-7">
        <h2 className="text-3xl font-bold text-white tracking-tight">Reviews</h2>
        {reviewCount > 0 && (
          <span className="text-sm font-semibold text-white/40">{reviewCount}</span>
        )}
      </div>

      {/* Average rating summary */}
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

      {/* New review form: only when authed and the user has NO review yet */}
      {canWrite && myReview == null && (
        <ReviewForm
          mode="new"
          rating={rating}
          body={body}
          error={error}
          busy={busy}
          onRating={setRating}
          onBody={setBody}
          onSubmit={save}
        />
      )}

      {/* Edit form: only while editing an existing review */}
      {myReview != null && editing && (
        <ReviewForm
          mode="edit"
          rating={rating}
          body={body}
          error={error}
          busy={busy}
          onRating={setRating}
          onBody={setBody}
          onCancel={() => setEditing(false)}
          onSubmit={save}
        />
      )}

      {/* Review list */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading reviews...</p>
      ) : bucket.reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet{canWrite ? ' — be the first!' : '.'}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {bucket.reviews.map((review) => {
            const mine = user && review.user_id === user.id;
            return (
              <div key={review.id} className="liquid-glass rounded-2xl p-5 flex gap-4">
                <UserAvatar name={review.user_nickname ? `@${review.user_nickname}` : `User ${review.user_id}`} avatar={review.user_avatar} userId={review.user_id} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{review.user_nickname ? `@${review.user_nickname}` : `User ${review.user_id}`}</span>
                      {mine && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">You</span>
                      )}
                      {review.created_at && (
                        <span className="text-xs text-white/30">{new Date(review.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Stars rating={review.rating} />
                      {mine && myReview && (
                        <>
                          <button
                            type="button"
                            onClick={startEditing}
                            disabled={busy}
                            className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={remove}
                            disabled={busy}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {review.body && <p className="text-gray-200 text-sm leading-relaxed">{review.body}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  mode,
  rating,
  body,
  error,
  busy,
  onRating,
  onBody,
  onCancel,
  onSubmit,
}: {
  mode: 'new' | 'edit';
  rating: number;
  body: string;
  error: string | null;
  busy: boolean;
  onRating: (n: number) => void;
  onBody: (s: string) => void;
  onCancel?: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="liquid-glass rounded-2xl p-5 mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-white">
          {mode === 'edit' ? 'Edit your review' : 'Write a review'}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRating(n)}
              aria-label={`Rate ${n} out of 10`}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                n <= rating ? 'bg-red-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => onBody(e.target.value)}
        placeholder="Share your thoughts on this title..."
        rows={3}
        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/60 mb-3"
      />
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || body.trim() === ''}
          className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-bold text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {busy ? 'Saving...' : mode === 'edit' ? 'Save' : 'Post'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold text-white/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
