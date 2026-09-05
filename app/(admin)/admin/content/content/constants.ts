import type { ListFilterField } from '@/components/admin/lists/ListFilterDropdown';

export type ContentKind = 'movie' | 'tv';

export interface ContentRow {
  kind: ContentKind;
  id: number;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  views: number;
  genres: { name: string }[] | null;
  created_at: string;
}

export type TypeFilter = 'all' | 'movie' | 'tv';

export const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

export const PAGE_SIZE_SINGLE = 20;
// Merged view pulls this many per endpoint so the combined page stays at 20 rows.
export const PAGE_SIZE_MERGED = 10;

export const FILTER_FIELDS: ListFilterField[] = [
  { kind: 'genres', key: 'genre', label: 'Genre' },
  { kind: 'number', key: 'year', label: 'Year', placeholder: 'e.g. 2024' },
  {
    kind: 'select',
    key: 'language',
    label: 'Language',
    options: [
      { value: 'en', label: 'English' },
      { value: 'id', label: 'Indonesian' },
      { value: 'ko', label: 'Korean' },
      { value: 'ja', label: 'Japanese' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
    ],
  },
];

export const RESERVED_PARAMS = new Set(['page', 'per_page', 'search', 'sort', 'direction']);
