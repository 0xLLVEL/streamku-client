'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface TmdbSearchResult {
  id: number;
  title?: string | null;
  name?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
}

interface UseTmdbSearchOptions {
  /** Server action performing the search; returns up to five results. */
  searchAction: (query: string) => Promise<{ success: boolean; results?: TmdbSearchResult[] }>;
}

/**
 * Debounced TMDB search with an anchored dropdown rendered in a portal.
 * Keeps all positioning/open state out of the form components.
 */
export function useTmdbSearch({ searchAction }: UseTmdbSearchOptions) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateAnchorRect = () => {
    if (inputRef.current) {
      setAnchorRect(inputRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target) || inputRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    const handleScroll = () => {
      if (isOpen) {
        updateAnchorRect();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setIsOpen(true);

    if (!nextQuery.trim()) {
      setResults([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchAction(nextQuery);
      if (res.success && res.results) {
        setResults(res.results.slice(0, 5));
      }
      setIsSearching(false);
    }, 400);
  };

  const handleFocus = () => {
    updateAnchorRect();
    if (query) setIsOpen(true);
  };

  /** Close the dropdown and clear the current search. */
  const reset = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const renderDropdown = (onSelect: (tmdbId: string) => void) => {
    if (!isOpen || (!query && !isSearching) || !anchorRect) {
      return null;
    }

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: anchorRect.bottom + 8,
          left: anchorRect.left,
          width: anchorRect.width,
          zIndex: 9999,
        }}
        className="bg-[#0a0a0a] border border-red-500/20 rounded-xl shadow-[0_8px_30px_rgb(220,38,38,0.15)] overflow-hidden"
      >
        {isSearching ? (
          <div className="p-4 text-sm text-white/50 text-center">Searching...</div>
        ) : results.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto">
            {results.map((result) => (
              <li key={result.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      reset();
                      onSelect(String(result.id));
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                  >
                  {result.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                      alt=""
                      className="w-8 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center text-[10px] text-white/30">
                      No img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {result.title ?? result.name}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {(result.release_date ?? result.first_air_date)?.split('-')[0] ?? 'N/A'} • TMDB ID:{' '}
                      {result.id}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-sm text-white/50 text-center">No results found.</div>
        )}
      </div>,
      document.body,
    );
  };

  return { query, inputRef, handleChange, handleFocus, reset, renderDropdown };
}
