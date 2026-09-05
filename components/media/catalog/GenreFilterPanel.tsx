'use client';

import { Button } from '@/components/ui/Button';
import type { Genre } from '@/types';

interface GenreFilterPanelProps {
  genres: Genre[];
  genre: string;
  onGenre: (slug: string) => void;
  hasActiveFilters: boolean;
  onClearGenre: () => void;
  onClearAll: () => void;
}

export function GenreFilterPanel({ genres, genre, onGenre, hasActiveFilters, onClearGenre, onClearAll }: GenreFilterPanelProps) {
  return (
    <div id="genre-filters" className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Genres</h2>
        {hasActiveFilters && (
          <button onClick={onClearGenre} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
        <button
          onClick={() => onGenre('')}
          aria-pressed={genre === ''}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors focus-ring ${genre === '' ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'}`}
        >
          All genres
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => onGenre(genre === g.slug ? '' : g.slug)}
            aria-pressed={genre === g.slug}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors focus-ring ${genre === g.slug ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'}`}
          >
            {g.name}
          </button>
        ))}
      </div>
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={onClearAll}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}
