/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client.utils';
import type { Genre, MediaItem } from '@/types';
import { PER_PAGE, type CatalogType } from '../constants';

export function useCatalogQuery(type: CatalogType) {
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
        params.set('per_page', PER_PAGE);
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
  const retry = () => setPage((p) => p);

  return { q, setQ, genre, setGenre, sort, setSort, page, setPage, showFilters, setShowFilters, items, total, lastPage, genres, loading, error, hasActiveFilters, clearAll, retry };
}
