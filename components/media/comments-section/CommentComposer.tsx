import { UserAvatar } from '@/components/media/UserAvatar';
import { COMPOSER_HINT } from './constants';
import type { CommentComposerProps } from './types';

export function CommentComposer({ body, busy, error, replyTo, placeholder, userName, userAvatar, userId, onBody, onCancelReply, onSubmit }: CommentComposerProps) {
  return (
    <div className="liquid-glass rounded-2xl p-5 mb-8">
      {replyTo && (
        <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
          <span>Replying to</span>
          <UserAvatar name={replyTo.user_nickname ?? `User ${replyTo.user_id}`} avatar={replyTo.user_avatar} userId={replyTo.user_id} size="sm" className="w-5 h-5 text-[10px]" />
          <span className="font-semibold text-white">{replyTo.user_nickname ?? `User ${replyTo.user_id}`}</span>
          <button type="button" onClick={onCancelReply} className="ml-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer">
            cancel
          </button>
        </p>
      )}
      <div className="flex items-start gap-3">
        <UserAvatar name={userName} avatar={userAvatar} userId={userId} size="sm" />
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => onBody(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/60 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>{COMPOSER_HINT}</span>
            </div>
            <button
              type="button"
              onClick={onSubmit}
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
  );
}
