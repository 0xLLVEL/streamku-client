import type { MediaItem } from '@/types';

export interface HeroCarouselProps {
  items: MediaItem[];
}

export interface HeroSlideProps {
  item: MediaItem;
  isActive: boolean;
}

export interface HeroMetaProps {
  item: MediaItem;
}

export interface HeroActionsProps {
  slug: string | undefined;
  isMovie: boolean;
}

export interface CarouselIndicatorsProps {
  count: number;
  currentIndex: number;
  autoplayMs: number;
  onSelect: (index: number) => void;
}
