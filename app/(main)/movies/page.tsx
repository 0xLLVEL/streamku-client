import { MediaCatalog } from '@/components/media/MediaCatalog';

export const metadata = {
  title: 'Movies — Streamku',
  description: 'Explore our entire collection of cinematic masterpieces — filter by genre, sort, and search.',
};

export default function MoviesPage() {
  return (
    <MediaCatalog
      type="movie"
      title="Movies"
      description="Discover films from every era and genre. Search, filter, and sort to find your next favorite — from timeless classics to the latest releases."
    />
  );
}
