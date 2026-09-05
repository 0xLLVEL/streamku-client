'use client';

import { PosterCard } from '@/components/media/PosterCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { MediaItem } from '@/types';

interface CatalogGridProps {
  loading: boolean;
  error: string | null;
  title: string;
  items: MediaItem[];
  q: string;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onRetry: () => void;
}

export function CatalogGrid({ loading, error, title, items, q, hasActiveFilters, onClearAll, onRetry }: CatalogGridProps) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label={`Loading ${title}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <h3 className="font-medium text-foreground">Couldn’t load {title.toLowerCase()}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div role="status" className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted" aria-hidden>
          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No {title.toLowerCase()} found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">Try a different search or filter.</p>
        {(q || hasActiveFilters) && <Button variant="outline" size="sm" className="mt-4" onClick={onClearAll}>Clear search & filters</Button>}
      </div>
    );
  }

  return (
    <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
      {items.map((item, idx) => (
        <li key={`${item.id}-${idx}`} role="listitem">
          <PosterCard item={item} priority={idx < 8} />
        </li>
      ))}
    </ul>
  );
}
