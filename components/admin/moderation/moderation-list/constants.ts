import type { ModerationFilter } from './types';

export const MODERATION_PER_PAGE = 20;

export const MODERATION_FILTERS: { value: ModerationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
];
