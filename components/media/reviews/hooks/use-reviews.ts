'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { submitReviewAction, deleteReviewAction } from '@/app/actions/reviews';
import { apiFetch } from '@/lib/api-client.utils';
import type { Review, ReviewBucket } from '@/types';

interface UseReviewsArgs {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: ReviewBucket;
}

export function useReviews({ mediaType, mediaId, slug, initial }: UseReviewsArgs) {
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

  return { user, bucket, loading, rating, body, error, busy, editing, setRating, setBody, setEditing, canWrite, myReview, avgRating, reviewCount, startEditing, save, remove };
}
