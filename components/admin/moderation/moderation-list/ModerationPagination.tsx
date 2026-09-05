'use client';

interface ModerationPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (next: number) => void;
}

export function ModerationPagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: ModerationPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      <button
        type="button"
        disabled={page <= 1 || isFetching}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
      >
        Prev
      </button>
      <span className="text-xs text-white/40">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages || isFetching}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
