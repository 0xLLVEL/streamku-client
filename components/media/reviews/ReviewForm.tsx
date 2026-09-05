interface ReviewFormProps {
  mode: 'new' | 'edit';
  rating: number;
  body: string;
  error: string | null;
  busy: boolean;
  onRating: (n: number) => void;
  onBody: (s: string) => void;
  onCancel?: () => void;
  onSubmit: () => void;
}

export function ReviewForm({ mode, rating, body, error, busy, onRating, onBody, onCancel, onSubmit }: ReviewFormProps) {
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
