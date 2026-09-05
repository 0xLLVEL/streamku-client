'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { submitCommentAction } from '@/app/actions/comments';
import { apiFetch } from '@/lib/api-client.utils';
import type { Comment, CommentThreads } from '@/types';

interface UseCommentsArgs {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: CommentThreads;
}

export function useComments({ mediaType, mediaId, slug, initial }: UseCommentsArgs) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<CommentThreads>(
    initial ?? { media_type: mediaType, media_id: mediaId, total: 0, comments: [] },
  );
  const [loading, setLoading] = useState(!initial);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    apiFetch(`/comments/${mediaType}/${mediaId}`, { requireAuth: false })
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json?.data && !cancelled) {
          setThreads({ ...json.data, media_type: mediaType, media_id: mediaId });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mediaType, mediaId, initial]);

  async function fetchComments() {
    try {
      const res = await apiFetch(`/comments/${mediaType}/${mediaId}`, { requireAuth: false });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setThreads({ ...json.data, media_type: mediaType, media_id: mediaId });
        }
      }
    } catch {}
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await submitCommentAction({
      mediaId,
      mediaType,
      slug,
      body,
      parentId: replyTo?.id,
    });
    setBusy(false);
    if (res.success) {
      setBody('');
      setReplyTo(null);
      fetchComments();
    } else {
      setError(res.error ?? 'Failed to post comment.');
    }
  }

  function startReply(comment: Comment) {
    setReplyTo(comment);
    setBody('');
  }

  return { user, threads, loading, body, replyTo, error, busy, canWrite: !!user, setBody, setReplyTo, fetchComments, submit, startReply };
}
