import type { RangeDays } from './types';

export const CHART_W = 1000;

export const CHART_H = 300;

/** Vertical span the tallest point may occupy (leaves headroom at the top). */
export const CHART_PLOT_H = 260;

export const RANGES: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
];
