export type GenreType = {
  id: number;
  name: string;
  slug: string;
};

export const GENRE_SEARCH_PLACEHOLDER = 'Filter genres...';

export const GENRE_NAME_PLACEHOLDER = 'New genre name...';

export function filterGenres(genres: GenreType[], search: string): GenreType[] {
  const query = search.trim().toLowerCase();
  if (!query) return genres;
  return genres.filter((genre) => genre.name.toLowerCase().includes(query));
}
