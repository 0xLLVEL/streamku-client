'use client';

import { useComments } from './hooks/use-comments';
import { CommentComposer } from './CommentComposer';
import { CommentThreads } from './CommentThreads';
import { COMPOSER_PLACEHOLDER, REPLY_PLACEHOLDER } from './constants';
import type { CommentsSectionProps } from './types';

export function CommentsSection({ mediaType, mediaId, slug, initial }: CommentsSectionProps) {
  const { user, threads, loading, body, replyTo, error, busy, canWrite, setBody, setReplyTo, fetchComments, submit, startReply } = useComments({ mediaType, mediaId, slug, initial });

  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-14 border-t border-white/10">
      <div className="flex items-baseline gap-3 mb-7">
        <h2 className="text-3xl font-bold text-white tracking-tight">Comments</h2>
        {threads.total > 0 && (
          <span className="text-sm font-semibold text-white/40">{threads.total}</span>
        )}
      </div>
      {canWrite && user && (
        <CommentComposer body={body} busy={busy} error={error} replyTo={replyTo} placeholder={replyTo ? REPLY_PLACEHOLDER : COMPOSER_PLACEHOLDER} userName={user.nickname ?? user.name} userAvatar={user.avatar} userId={user.id} onBody={setBody} onCancelReply={() => setReplyTo(null)} onSubmit={submit} />
      )}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : threads.comments.length === 0 ? (
        <p className="text-gray-500 text-sm">{canWrite ? 'No comments yet — start the discussion!' : 'No comments yet.'}</p>
      ) : (
        <CommentThreads comments={threads.comments} slug={slug} onDelete={fetchComments} onReply={startReply} />
      )}
    </div>
  );
}

export { CommentBox } from './CommentBox';
export { CommentComposer } from './CommentComposer';
export { CommentThreads } from './CommentThreads';
export type { CommentsSectionProps } from './types';
