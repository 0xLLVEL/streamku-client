import { UserAvatar } from '@/components/media/UserAvatar';
import type { Review } from '@/types';
import { Stars } from './Stars';

interface ReviewItemProps {
  review: Review;
  mine: boolean;
  showActions: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewItem({ review, mine, showActions, busy, onEdit, onDelete }: ReviewItemProps) {
  return (
    <div className="liquid-glass rounded-2xl p-5 flex gap-4">
      <UserAvatar name={review.user_nickname ?? `User ${review.user_id}`} avatar={review.user_avatar} userId={review.user_id} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{review.user_nickname ?? `User ${review.user_id}`}</span>
            {mine && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">You</span>
            )}
            {review.created_at && (
              <span className="text-xs text-white/30">{new Date(review.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Stars rating={review.rating} />
            {showActions && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  disabled={busy}
                  className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
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
}
