'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client.utils';
import { useClickOutside } from '@/hooks/use-click-outside';
import { FilterField } from './FilterField';
import type { ListFilterField } from './FilterField';

export type { ListFilterField, ListFilterSelectOption } from './FilterField';

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

/** Popover that lets users narrow an admin table by structured filters. */
export function ListFilterDropdown({ fields, value, onChange }: ListFilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

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
  const genreOptions = genres.map((g) => ({ value: String(g.id), label: g.name }));

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
            <FilterField
              key={field.key}
              field={field}
              value={value[field.key] ?? ''}
              onChange={(nextValue) => setField(field.key, nextValue)}
              genreOptions={genreOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
