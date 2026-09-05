'use client';

import { MODERATION_FILTERS } from './constants';
import type { ModerationFilter } from './types';

interface ModerationToolbarProps {
  filter: ModerationFilter;
  onFilterChange: (next: ModerationFilter) => void;
  total: number;
}

export function ModerationToolbar({ filter, onFilterChange, total }: ModerationToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        {MODERATION_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              filter === f.value ? 'bg-red-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-white/40">{total.toLocaleString()} total</span>
    </div>
  );
}
