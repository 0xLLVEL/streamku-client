'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { SeasonFormMessage } from './types';

interface SeasonHeaderProps {
  title: string;
  backHref: string;
  message: SeasonFormMessage | null;
  isSaving: boolean;
}

export function SeasonHeader({ title, backHref, message, isSaving }: SeasonHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#0C0C0E]/90 backdrop-blur-md z-10 sticky top-0">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link href={backHref} aria-label="Go back" className="text-white/40 hover:text-white transition-colors duration-200 cursor-pointer focus-ring rounded-md shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-lg sm:text-2xl font-medium text-white tracking-tight truncate">Edit &ldquo;{title}&rdquo;</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {message && (
          <span className={`hidden sm:inline text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </span>
        )}
        <Button type="submit" variant="brand" size="sm" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
