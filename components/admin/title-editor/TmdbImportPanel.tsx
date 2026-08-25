'use client';

import { useTmdbSearch, type TmdbSearchResult } from './useTmdbSearch';

interface TmdbImportPanelProps {
  placeholder: string;
  searchAction: (query: string) => Promise<{ success: boolean; results?: TmdbSearchResult[] }>;
  onImport: (tmdbId: string) => void;
}

/** "Import from TMDB" card with debounced search and portal dropdown. */
export function TmdbImportPanel({ placeholder, searchAction, onImport }: TmdbImportPanelProps) {
  const { query, inputRef, handleChange, handleFocus, renderDropdown } = useTmdbSearch({
    searchAction,
  });

  return (
    <div className="relative bg-gradient-to-br from-red-600/10 via-red-500/5 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md group">
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors duration-700" />
      </div>

      <div className="flex flex-row items-center gap-5 relative z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/20 border border-white/10 shadow-inner">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            Import from TMDB
          </h3>
          <p className="text-sm text-white/50 max-w-sm leading-relaxed">
            Enter a TMDB ID to automatically fetch all details, posters, backdrops, and cast.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-4 w-full md:w-[50%] relative z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full bg-[#000000] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/20 focus:outline-none transition-all placeholder:text-white/20"
          />
          {renderDropdown(onImport)}
        </div>
      </div>
    </div>
  );
}
