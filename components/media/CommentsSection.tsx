'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { submitCommentAction, deleteCommentAction } from '@/app/actions/comments';
import { apiFetch } from '@/lib/api-client.utils';
import { Comment, CommentThreads } from '@/types';
import { UserAvatar } from '@/components/media/UserAvatar';

function CommentBox({
  comment,
  slug,
  onDelete,
  onReply,
}: {
  comment: Comment;
  slug: string;
  onDelete: () => void;
  onReply: () => void;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const mine = user && comment.user_id === user.id;

  async function remove() {
    setBusy(true);
    const res = await deleteCommentAction({ id: comment.id, slug });
    setBusy(false);
    if (res.success) onDelete();
  }

  return (
    <div className="group flex gap-3 rounded-xl p-3 -mx-2 transition-colors hover:bg-white/[0.03]">
      <UserAvatar name={comment.user_nickname ?? `User ${comment.user_id}`} avatar={comment.user_avatar} userId={comment.user_id} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-white">{comment.user_nickname ?? `User ${comment.user_id}`}</span>
          {mine && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">You</span>
          )}
          {comment.created_at && (
            <span className="text-xs text-white/30">{new Date(comment.created_at).toLocaleDateString()}</span>
          )}
        </div>

        <p className="text-gray-200 text-sm leading-relaxed">{comment.body}</p>

        <div className="flex items-center gap-3 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          {user && (
            <button type="button" onClick={onReply} className="text-xs font-semibold text-white/50 hover:text-red-400 transition-colors cursor-pointer">
              Reply
            </button>
          )}
          {mine && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="text-xs font-semibold text-white/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              {busy ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({
  mediaType,
  mediaId,
  slug,
  initial,
}: {
  mediaType: 'movie' | 'tv_show';
  mediaId: number;
  slug: string;
  initial?: CommentThreads;
}) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<CommentThreads>(
    initial ?? {
      media_type: mediaType,
      media_id: mediaId,
      total: 0,
      comments: [],
    },
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

  const canWrite = !!user;

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

  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-14 border-t border-white/10">
      <div className="flex items-baseline gap-3 mb-7">
        <h2 className="text-3xl font-bold text-white tracking-tight">Comments</h2>
        {threads.total > 0 && (
          <span className="text-sm font-semibold text-white/40">{threads.total}</span>
        )}
      </div>

      {canWrite && (
        <div className="liquid-glass rounded-2xl p-5 mb-8">
          {replyTo && (
            <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
              <span>Replying to</span>
              <UserAvatar name={replyTo.user_nickname ?? `User ${replyTo.user_id}`} avatar={replyTo.user_avatar} userId={replyTo.user_id} size="sm" className="w-5 h-5 text-[10px]" />
              <span className="font-semibold text-white">{replyTo.user_nickname ?? `User ${replyTo.user_id}`}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="ml-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer">
                cancel
              </button>
            </p>
          )}
          <div className="flex items-start gap-3">
            {user && <UserAvatar name={user.nickname ?? user.name} avatar={user.avatar} userId={user.id} size="sm" />}
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={replyTo ? 'Write a reply...' : 'Share your thoughts on this title...'}
                rows={2}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/60 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>Be kind &amp; respectful</span>
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy || body.trim() === ''}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-bold text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {busy ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : threads.comments.length === 0 ? (
        <p className="text-gray-500 text-sm">{canWrite ? 'No comments yet — start the discussion!' : 'No comments yet.'}</p>
      ) : (
        <div className="flex flex-col">
          {threads.comments.map((comment) => (
            <div key={comment.id} className="border-b border-white/5 py-3 last:border-0">
              <CommentBox
                comment={comment}
                slug={slug}
                onDelete={fetchComments}
                onReply={() => {
                  setReplyTo(comment);
                  setBody('');
                }}
              />

              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-9 mt-1 pl-5 border-l-2 border-white/10 flex flex-col gap-2">
                  {comment.replies.map((reply) => (
                    <CommentBox
                      key={reply.id}
                      comment={reply}
                      slug={slug}
                      onDelete={fetchComments}
                      onReply={() => {
                        setReplyTo(reply);
                        setBody('');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
