export type CatalogType = 'movie' | 'tv';

export const PER_PAGE = '18';

export const SORT_OPTIONS = {
  movie: [
    { value: 'popularity', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'release_date', label: 'Newest' },
    { value: 'title', label: 'A – Z' },
  ],
  tv: [
    { value: 'popularity', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'first_air_date', label: 'Newest' },
    { value: 'name', label: 'A – Z' },
  ],
} as const;
