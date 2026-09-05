'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CHART_H, CHART_W } from './constants';
import { useChartCoords } from './hooks/use-chart-coords';
import { ChartGrid } from './ChartGrid';
import { formatChartDate } from './utils/format';
import type { EngagementPoint } from './types';

/**
 * Interactive area chart. Dots are real <button>s so the chart is keyboard
 * accessible; the tooltip and crosshair follow the hovered/focused point.
 */
export function EngagementChart({ data }: { data: EngagementPoint[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const { coords, linePath, areaPath, yTicks, xLabels } = useChartCoords(data);

  const active = activeIndex !== null ? coords[activeIndex] : null;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setActiveIndex(Math.round(fraction * (data.length - 1)));
  };

  return (
    <div>
      <div
        className="relative h-[280px]"
        onMouseMove={handleMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <ChartGrid ticks={yTicks} />

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
                aria-label={`${formatChartDate(c.date)}: ${c.watches.toLocaleString()} plays`}
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
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{formatChartDate(active.date)}</p>
              <p className="text-sm font-semibold text-white tabular-nums">{active.watches.toLocaleString()} plays</p>
            </div>
          )}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between ml-11 mt-3 pt-2 border-t border-white/5 text-[10px] text-white/40">
        {xLabels.map((label) => (
          <span key={label}>{formatChartDate(label)}</span>
        ))}
      </div>
    </div>
  );
}
