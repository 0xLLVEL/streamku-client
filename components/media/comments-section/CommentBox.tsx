'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { deleteCommentAction } from '@/app/actions/comments';
import { UserAvatar } from '@/components/media/UserAvatar';
import type { CommentBoxProps } from './types';

export function CommentBox({ comment, slug, onDelete, onReply }: CommentBoxProps) {
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
