'use client';

import type * as React from 'react';
import { Input } from '@/components/ui/Input';
import { DATA_TABLE_SEARCH_PLACEHOLDER } from './constants';

interface DataTableToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: React.Dispatch<React.SetStateAction<string>>;
  toolbarAction?: React.ReactNode;
}

export function DataTableToolbar({
  globalFilter,
  onGlobalFilterChange,
  toolbarAction,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="relative w-full sm:max-w-sm">
        <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <Input
          type="text"
          placeholder={DATA_TABLE_SEARCH_PLACEHOLDER}
          value={globalFilter ?? ''}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          aria-label="Search all columns"
          className="h-10 rounded-lg py-0 pl-10 pr-3 text-sm placeholder:text-white/30"
        />
      </div>

      {toolbarAction}
    </div>
  );
}
