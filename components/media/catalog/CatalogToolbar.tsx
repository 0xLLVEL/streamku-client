'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { SORT_OPTIONS, type CatalogType } from './constants';

interface CatalogToolbarProps {
  type: CatalogType;
  title: string;
  q: string;
  onQ: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
}

export function CatalogToolbar({ type, title, q, onQ, sort, onSort, showFilters, onToggleFilters, hasActiveFilters }: CatalogToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-xl">
        <label htmlFor="catalog-search" className="sr-only">Search {title}</label>
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <Input
          id="catalog-search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search titles…"
          className="!h-10 pl-9 rounded-lg bg-card py-0"
          autoComplete="off"
        />
        {q && (
          <button
            aria-label="Clear search"
            onClick={() => onQ('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        <Select value={sort} onValueChange={(v) => onSort(v ?? 'popularity')}>
          <SelectTrigger className="!h-10 w-[148px] justify-between rounded-lg border-input bg-card px-3 py-0 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS[type].map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="default"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
          aria-controls="genre-filters"
          className="!h-10 w-[148px] justify-center gap-2 rounded-lg border-input bg-card px-3 py-0 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4M12 16h0" /></svg>
          Filters
          {hasActiveFilters && <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-bold text-background">{1}</span>}
        </Button>
      </div>
    </div>
  );
}
