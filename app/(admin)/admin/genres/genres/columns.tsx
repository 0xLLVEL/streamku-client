'use client';

import Link from 'next/link';
import { DeleteButton } from '@/components/admin/lists/DeleteButton';
import type { GenreType } from './constants';

/** One genre tile: icon, names, edit link + delete. (Grid has no table columns.) */
export function GenreCard({ genre }: { genre: GenreType }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition-colors duration-200 hover:border-white/20 hover:bg-black/50">
      <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0" aria-hidden>
        <TagIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{genre.name}</p>
        <p className="text-[11px] text-white/40 truncate">/{genre.slug}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/admin/genres/${genre.id}`}
          aria-label={`Edit ${genre.name}`}
          title="Edit genre"
          className="p-2 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer focus-ring"
        >
          <PencilIcon />
        </Link>
        <DeleteButton id={genre.id} type="genres" />
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
