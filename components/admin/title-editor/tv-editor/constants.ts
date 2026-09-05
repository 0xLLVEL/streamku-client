import type { TitleFieldConfig } from '../PrimaryFactsTab';
import type { TitleDisplayData } from '../types';

export const TV_SHOW_FIELDS: TitleFieldConfig = {
  titleName: 'name',
  titleLabel: 'Name',
  dateName: 'first_air_date',
  dateLabel: 'First air date',
  statusOptions: ['Returning Series', 'Ended', 'Canceled', 'In Production'],
  statusDefault: 'Returning Series',
  metric: { name: 'number_of_seasons', label: 'Number of seasons', readOnly: true },
  overviewRows: 5,
};

export const TV_TABS = [
  { id: 'primary_facts', label: 'Overview' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'images', label: 'Images' },
  { id: 'cast', label: 'Cast' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'comments', label: 'Comments' },
];

export const EMPTY_TV_SHOW: TitleDisplayData = { id: null };
