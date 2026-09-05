'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client.utils';

export interface ListFilterSelectOption {
  value: string;
  label: string;
}

export type ListFilterField =
  | {
      kind: 'select';
      key: string;
      label: string;
      options: ListFilterSelectOption[];
    }
  | {
      /** Options are loaded from `/genres`; values are genre ids. */
      kind: 'genres';
      key: string;
      label: string;
    }
  | {
      kind: 'number';
      key: string;
      label: string;
      placeholder?: string;
    };

interface ListFilterDropdownProps {
  fields: ListFilterField[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

function setFieldIn(
  filters: Record<string, string>,
  key: string,
  nextValue: string,
): Record<string, string> {
  const next = { ...filters };
  if (nextValue) {
    next[key] = nextValue;
  } else {
    delete next[key];
  }
  return next;
}

const SELECT_CLASS =
  'bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50 cursor-pointer';

/** Popover that lets users narrow an admin table by structured filters. */
export function ListFilterDropdown({ fields, value, onChange }: ListFilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const needsGenres = fields.some((field) => field.kind === 'genres');
  const { data: genres = [] } = useQuery({
    queryKey: ['list-filter-genres'],
    queryFn: async () => {
      const res = await apiFetch('/genres');
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? (json.data as { id: number; name: string }[]) : [];
    },
    enabled: needsGenres,
  });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = Object.values(value).filter(Boolean).length;

  const setField = (key: string, nextValue: string) => {
    onChange(setFieldIn(value, key, nextValue));
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-[#101014] border border-white/10 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer focus-ring"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filter
        {activeCount > 0 && (
          <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#101014] border border-white/10 rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)] p-4 z-50 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({})}
                className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:text-red-300"
              >
                Clear all
              </button>
            )}
          </div>

          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {field.label}
              </label>

              {field.kind === 'number' ? (
                <input
                  type="number"
                  placeholder={field.placeholder}
                  value={value[field.key] ?? ''}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className={SELECT_CLASS}
                />
              ) : (
                <select
                  value={value[field.key] ?? ''}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">All {field.label}s</option>
                  {(field.kind === 'genres' ? genres.map((g) => ({ value: String(g.id), label: g.name })) : field.options).map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
