/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import { PosterCard } from '@/components/media/PosterCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { Genre, MediaItem } from '@/types';

type CatalogType = 'movie' | 'tv';

interface Props {
  type: CatalogType;
  title: string;
  description: string;
}

const SORT_OPTIONS = {
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

export function MediaCatalog({ type, title, description }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') ?? '';
  const initialGenre = searchParams.get('genre') ?? '';
  const initialSort = searchParams.get('sort') ?? 'popularity';

  const [q, setQ] = useState(initialQ);
  const [genre, setGenre] = useState(initialGenre);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const [showFilters, setShowFilters] = useState(!!initialGenre);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (genre) p.set('genre', genre);
    if (sort !== 'popularity') p.set('sort', sort);
    if (page > 1) p.set('page', String(page));
    return p.toString();
  }, [q, genre, sort, page]);

  useEffect(() => {
    router.replace(syncUrl ? `?${syncUrl}` : window.location.pathname, { scroll: false });
  }, [syncUrl, router]);

  useEffect(() => {
    apiFetch('/genres', { requireAuth: false })
      .then(async (r) => {
        if (!r.ok) return;
        const j = await r.json();
        setGenres(j.data ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        if (q.trim().length >= 2) {
          const res = await apiFetch(`/search?q=${encodeURIComponent(q)}`, { requireAuth: false });
          if (!res.ok) throw new Error('Search failed');
          const j = await res.json();
          const list: MediaItem[] = type === 'movie' ? j.data?.movies ?? [] : j.data?.tv_shows ?? [];
          const sorted = [...list].sort((a, b) => {
            if (sort === 'rating') return (b.vote_average ?? 0) - (a.vote_average ?? 0);
            if (sort === 'title' || sort === 'name') return (a.title || a.name || '').localeCompare(b.title || b.name || '');
            const da = (a.release_date || a.first_air_date || '') as string;
            const db = (b.release_date || b.first_air_date || '') as string;
            if (sort === 'release_date' || sort === 'first_air_date') return db.localeCompare(da);
            return (b.popularity ?? 0) - (a.popularity ?? 0);
          });
          const filtered = genre ? sorted.filter((it) => (it.genres ?? []).some((g) => g.slug === genre)) : sorted;
          if (!cancelled) {
            setItems(filtered);
            setTotal(filtered.length);
            setLastPage(1);
          }
          return;
        }
        const params = new URLSearchParams();
        if (genre) params.set('genre', genre);
        if (sort) params.set('sort', sort);
        params.set('page', String(page));
        params.set('per_page', '18');
        const endpoint = type === 'movie' ? `/movies?${params}` : `/tv-shows?${params}`;
        const res = await apiFetch(endpoint, { requireAuth: false });
        if (!res.ok) throw new Error('Failed to load');
        const j = await res.json();
        if (cancelled) return;
        setItems(j.data ?? []);
        setTotal(j.meta?.total ?? j.data?.length ?? 0);
        setLastPage(j.meta?.last_page ?? 1);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, genre, sort, page, type]);

  useEffect(() => {
    setPage(1);
  }, [q, genre, sort]);

  const hasActiveFilters = genre !== '';
  const clearAll = () => {
    setQ('');
    setGenre('');
    setSort('popularity');
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Title */}
        <div className="mb-8">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[30px] font-semibold tracking-tight text-foreground leading-none">{title}</h1>
            <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {loading ? '—' : `${total.toLocaleString()} titles`}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        {/* Controls — single elegant row */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xl">
              <label htmlFor="catalog-search" className="sr-only">Search {title}</label>
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <Input
                id="catalog-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search titles…"
                className="h-10 pl-9"
                autoComplete="off"
              />
              {q && (
                <button
                  aria-label="Clear search"
                  onClick={() => setQ('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <Select value={sort} onValueChange={(v) => setSort(v ?? 'popularity')}>
                <SelectTrigger className="h-10 w-[148px] bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS[type].map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showFilters || hasActiveFilters ? 'secondary' : 'outline'}
                size="default"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-controls="genre-filters"
                className="h-10 gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4M12 16h0" /></svg>
                Filters
                {hasActiveFilters && <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-bold text-background">{1}</span>}
              </Button>
            </div>
          </div>

          {/* Collapsible genre panel — clean, wrapped, not endless scroll */}
          {showFilters && (
            <div id="genre-filters" className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-foreground">Genres</h2>
                {hasActiveFilters && (
                  <button onClick={() => setGenre('')} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
                <button
                  onClick={() => setGenre('')}
                  aria-pressed={genre === ''}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors focus-ring ${genre === '' ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'}`}
                >
                  All genres
                </button>
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenre(genre === g.slug ? '' : g.slug)}
                    aria-pressed={genre === g.slug}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors focus-ring ${genre === g.slug ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'}`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end border-t border-border pt-3">
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear all filters</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div aria-busy="true" aria-label={`Loading ${title}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <h3 className="font-medium text-foreground">Couldn’t load {title.toLowerCase()}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setPage((p) => p)}>Try again</Button>
          </div>
        ) : items.length === 0 ? (
          <div role="status" className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted" aria-hidden>
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">No {title.toLowerCase()} found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">Try a different search or filter.</p>
            {(q || hasActiveFilters) && <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>Clear search & filters</Button>}
          </div>
        ) : (
          <>
            <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {items.map((item, idx) => (
                <li key={`${item.id}-${idx}`} role="listitem">
                  <PosterCard item={item} priority={idx < 6} />
                </li>
              ))}
            </ul>

            <nav aria-label="Pagination" className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground tabular-nums">
                Page {page} of {lastPage} <span className="hidden sm:inline">• {total.toLocaleString()} titles</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))} aria-label="Next page">Next</Button>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
