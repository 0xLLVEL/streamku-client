'use client';

import { useMemo } from 'react';
import { CHART_H, CHART_PLOT_H, CHART_W } from '../constants';
import { formatCompact } from '../utils/format';
import { smoothPath } from '../utils/smooth-path';
import type { ChartCoord, EngagementPoint } from '../types';

export function useChartCoords(data: EngagementPoint[]) {
  const maxWatches = Math.max(1, ...data.map((d) => d.watches));

  const coords: ChartCoord[] = useMemo(
    () =>
      data.map((d, idx) => ({
        ...d,
        // Leave headroom above the tallest point instead of touching the top edge.
        x: (idx / Math.max(data.length - 1, 1)) * CHART_W,
        y: CHART_H - (d.watches / maxWatches) * CHART_PLOT_H,
      })),
    [data, maxWatches],
  );

  const linePath = useMemo(() => smoothPath(coords), [coords]);
  const areaPath = coords.length > 1 ? `${linePath} L ${CHART_W},${CHART_H} L 0,${CHART_H} Z` : '';

  const yTicks = useMemo(
    () => [1, 0.75, 0.5, 0.25, 0].map((fraction) => ({
      label: formatCompact(Math.round(maxWatches * fraction)),
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

  return { coords, maxWatches, linePath, areaPath, yTicks, xLabels };
}
