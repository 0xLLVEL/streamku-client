import { CommentBox } from './CommentBox';
import type { CommentThreadsProps } from './types';

export function CommentThreads({ comments, slug, onDelete, onReply }: CommentThreadsProps) {
  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-white/5 py-3 last:border-0">
          <CommentBox comment={comment} slug={slug} onDelete={onDelete} onReply={() => onReply(comment)} />
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-9 mt-1 pl-5 border-l-2 border-white/10 flex flex-col gap-2">
              {comment.replies.map((reply) => (
                <CommentBox key={reply.id} comment={reply} slug={slug} onDelete={onDelete} onReply={() => onReply(reply)} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
