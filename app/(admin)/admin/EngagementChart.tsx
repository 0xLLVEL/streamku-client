'use client';

import { useMemo, useState } from 'react';
import { AdminCard } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export interface EngagementPoint {
  date: string;
  watches: number;
}

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

const CHART_W = 1000;
const CHART_H = 300;

type RangeDays = 7 | 30;

const RANGES: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
];

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
          <p className="text-sm font-semibold text-white/80 tabular-nums">{compactFormatter.format(peak)}</p>
          <p className="mt-0.5 text-[11px] text-white/40">peak day</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white/80 tabular-nums">{compactFormatter.format(average)}</p>
          <p className="mt-0.5 text-[11px] text-white/40">daily average</p>
        </div>
      </div>

      <EngagementChart data={sliced} />
    </AdminCard>
  );
}

/**
 * Interactive area chart. Dots are real <button>s so the chart is keyboard
 * accessible; the tooltip and crosshair follow the hovered/focused point.
 */
export function EngagementChart({ data }: { data: EngagementPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxWatches = Math.max(1, ...data.map((d) => d.watches));

  const coords = useMemo(
    () =>
      data.map((d, idx) => ({
        ...d,
        // Leave headroom above the tallest point instead of touching the top edge.
        x: (idx / Math.max(data.length - 1, 1)) * CHART_W,
        y: CHART_H - (d.watches / maxWatches) * 260,
      })),
    [data, maxWatches],
  );

  const linePath = useMemo(() => smoothPath(coords), [coords]);
  const areaPath = coords.length > 1 ? `${linePath} L ${CHART_W},${CHART_H} L 0,${CHART_H} Z` : '';

  const yTicks = useMemo(
    () => [1, 0.75, 0.5, 0.25, 0].map((fraction) => ({
      label: compactFormatter.format(Math.round(maxWatches * fraction)),
      fraction,
    })),
    [maxWatches],
  );

  const xLabels = useMemo(() => {
    const step = Math.max(1, Math.floor(data.length / 6));
    const labels = data
      .filter((_, idx) => idx % step === 0)
      .map((d) => d.date);
    const last = data[data.length - 1]?.date;
    if (last && !labels.includes(last)) labels.push(last);
    return labels;
  }, [data]);

  const active = activeIndex !== null ? coords[activeIndex] : null;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setActiveIndex(Math.round(fraction * (data.length - 1)));
  };

  return (
    <div>
      {/* Plot area */}
      <div
        className="relative h-[280px]"
        onMouseMove={handleMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {/* Y-axis grid */}
        <div className="absolute inset-0 flex flex-col justify-between z-0">
          {yTicks.map((tick) => (
            <div key={tick.fraction} className="flex items-center gap-4 w-full">
              <span className="text-[10px] text-white/40 w-7 text-right tabular-nums">{tick.label}</span>
              <div className="flex-1 border-t border-white/5" />
            </div>
          ))}
        </div>

        {/* Line + area (stretched SVG keeps strokes crisp at any width) */}
        <div className="absolute inset-y-0 left-11 right-0 z-10 py-2.5">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="plays-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#plays-gradient)" />}
            <path d={linePath} fill="none" stroke="#DC2626" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Crosshair + interactive dots + tooltip (un-stretched overlay keeps dots round) */}
        <div className="absolute inset-y-0 left-11 right-0 z-20">
          {active && (
            <div
              aria-hidden
              className="absolute top-0 bottom-0 w-px bg-white/15"
              style={{ left: `${(active.x / CHART_W) * 100}%` }}
            />
          )}
          {coords.map((c, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={c.date}
                type="button"
                aria-label={`${formatDate(c.date)}: ${c.watches.toLocaleString()} plays`}
                onMouseEnter={() => setActiveIndex(idx)}
                onFocus={() => setActiveIndex(idx)}
                onBlur={() => setActiveIndex(null)}
                className={cn(
                  'absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'scale-125 bg-red-500 border-red-300'
                    : 'bg-[#101014] border-red-600 hover:border-red-400',
                )}
                style={{ left: `${(c.x / CHART_W) * 100}%`, top: `${(c.y / CHART_H) * 100}%` }}
              />
            );
          })}

          {active && (
            <div
              role="status"
              className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-lg border border-white/10 bg-[#18181C] px-3 py-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.9)]"
              style={{
                left: `${Math.min(Math.max((active.x / CHART_W) * 100, 10), 90)}%`,
                top: `${(active.y / CHART_H) * 100}%`,
              }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{formatDate(active.date)}</p>
              <p className="text-sm font-semibold text-white tabular-nums">{active.watches.toLocaleString()} plays</p>
            </div>
          )}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between ml-11 mt-3 pt-2 border-t border-white/5 text-[10px] text-white/40">
        {xLabels.map((label) => (
          <span key={label}>{formatDate(label)}</span>
        ))}
      </div>
    </div>
  );
}

/** Catmull-Rom → cubic bezier smoothing for the trend line. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
