'use client';

import type { ModerationRow } from './types';

interface ModerationTableProps {
  label: string;
  rows: ModerationRow[];
  showRating?: boolean;
  onToggle: (row: ModerationRow) => void;
  onRemove: (row: ModerationRow) => void;
}

export function ModerationTable({ label, rows, showRating, onToggle, onRemove }: ModerationTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-semibold text-white/80">No {label}s found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">{label}</th>
            {showRating && <th className="px-3 py-2">Rating</th>}
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="px-3 py-3 text-sm text-white/80 whitespace-nowrap">{r.user_name ?? `User ${r.user_id}`}</td>
              <td className="px-3 py-3 text-sm text-white/80 max-w-[200px] truncate">{r.media_title ?? '—'}</td>
              <td className="px-3 py-3 text-sm text-white/60 max-w-[360px]">
                <div className="line-clamp-3">{r.body}</div>
              </td>
              {showRating && <td className="px-3 py-3 text-sm text-yellow-400 whitespace-nowrap">{r.rating ?? '—'}</td>}
              <td className="px-3 py-3 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    r.is_approved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                  }`}
                >
                  {r.is_approved ? 'Visible' : 'Hidden'}
                </span>
              </td>
              <td className="px-3 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onToggle(r)}
                  className="text-[13px] font-semibold text-white/60 hover:text-white mr-3 cursor-pointer"
                >
                  {r.is_approved ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(r)}
                  className="text-[13px] font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
