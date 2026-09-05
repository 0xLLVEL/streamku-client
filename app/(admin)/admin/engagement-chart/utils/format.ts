const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatChartDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
