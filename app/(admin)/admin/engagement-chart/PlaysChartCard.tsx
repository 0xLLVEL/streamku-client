'use client';

import { useMemo, useState } from 'react';
import { AdminCard } from '@/components/admin/ui';
import { cn } from '@/lib/utils';
import { RANGES } from './constants';
import { EngagementChart } from './EngagementChart';
import { formatCompact } from './utils/format';
import type { EngagementPoint, RangeDays } from './types';

/**
 * Plays-over-time card: summary header, 7/30-day toggle and the interactive
 * chart. Server data comes in as props; all interaction is local.
 */
export function PlaysChartCard({ data }: { data: EngagementPoint[] }) {
  const [range, setRange] = useState<RangeDays>(30);

  const sliced = useMemo(() => data.slice(-range), [data, range]);
  const total = useMemo(() => sliced.reduce((acc, cur) => acc + cur.watches, 0), [sliced]);
  const peak = useMemo(() => sliced.reduce((max, d) => Math.max(max, d.watches), 0), [sliced]);
  const average = sliced.length > 0 ? Math.round(total / sliced.length) : 0;

  return (
    <AdminCard className="lg:col-span-2 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Plays</h3>
          <p className="text-xs text-white/40 mt-0.5">Playback activity across the catalog</p>
        </div>
        <div className="flex bg-black/30 border border-white/10 rounded-lg p-0.5" role="group" aria-label="Date range">
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              aria-pressed={range === option.value}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 cursor-pointer focus-ring',
                range === option.value
                  ? 'bg-red-600 text-white shadow-[0_2px_10px_0_rgba(220,38,38,0.35)]'
                  : 'text-white/50 hover:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-end gap-6 mb-6">
        <div>
          <p className="text-[28px] font-medium leading-none text-white tabular-nums">{total.toLocaleString()}</p>
          <p className="mt-1.5 text-xs text-white/40">total plays · last {range} days</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white/80 tabular-nums">{formatCompact(peak)}</p>
          <p className="mt-0.5 text-[11px] text-white/40">peak day</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white/80 tabular-nums">{formatCompact(average)}</p>
          <p className="mt-0.5 text-[11px] text-white/40">daily average</p>
        </div>
      </div>

      <EngagementChart data={sliced} />
    </AdminCard>
  );
}
