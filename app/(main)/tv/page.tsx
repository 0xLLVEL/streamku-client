import { MediaCatalog } from '@/components/media/MediaCatalog';

export const metadata = {
  title: 'TV Series — Streamku',
  description: 'Binge-worthy series from every genre — filter by genre, sort, and search.',
};

export default function TvShowsPage() {
  return (
    <MediaCatalog
      type="tv"
      title="TV Series"
      description="From gripping dramas to light comedies — browse every series, filter by genre, and jump back in where you left off."
    />
  );
}
