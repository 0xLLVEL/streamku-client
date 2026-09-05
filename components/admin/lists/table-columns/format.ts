const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatTableDate(value: string | null | undefined): string {
  return value ? dateFormatter.format(new Date(value)) : '-';
}
