import type { TitleFieldConfig } from '../PrimaryFactsTab';
import type { TitleDisplayData } from '../types';

export const MOVIE_FIELDS: TitleFieldConfig = {
  titleName: 'title',
  titleLabel: 'Title',
  dateName: 'release_date',
  dateLabel: 'Release date',
  statusOptions: ['Released', 'Post Production', 'Rumored'],
  statusDefault: 'Released',
  metric: { name: 'runtime', label: 'Runtime (minutes)' },
  overviewRows: 4,
};

export const MOVIE_TABS = [
  { id: 'primary_facts', label: 'Overview' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Streams' },
  { id: 'cast', label: 'Cast' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'comments', label: 'Comments' },
];

export const EMPTY_MOVIE: TitleDisplayData = { id: null };
