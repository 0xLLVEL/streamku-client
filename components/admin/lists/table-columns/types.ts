import type { AdminResourceType } from '../resource-list/types';

export interface HasGenres {
  genres?: { name: string }[] | null;
}

export interface PosterTitleColumnOptions<TData> {
  header: string;
  imagePath: (row: TData) => string | null;
  title: (row: TData) => string;
  subtitleId: (row: TData) => { tmdbId: number | null; id: number };
}

export interface ActionsColumnOptions {
  editHref: (id: number) => string;
  deleteType: AdminResourceType;
}
