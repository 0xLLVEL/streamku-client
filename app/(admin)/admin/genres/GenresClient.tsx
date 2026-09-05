'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, AdminPageHeader } from '@/components/admin/ui';
import { PlusIcon } from '@/components/ui/icons';
import { createGenre } from './genres/api';
import { filterGenres, GENRE_NAME_PLACEHOLDER, GENRE_SEARCH_PLACEHOLDER } from './genres/constants';
import { GenreCard } from './genres/columns';
import type { GenreType } from './genres/constants';

export type { GenreType } from './genres/constants';

/** Genre management as a searchable tile grid with inline create. */
export function GenresClient({ initialGenres }: { initialGenres: GenreType[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const visible = filterGenres(initialGenres, search);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setIsCreating(true);
    setMessage(null);

    const res = await createGenre(name);

    if (res.success) {
      setNewName('');
      setMessage({ text: `Genre "${name}" created.`, type: 'success' });
      router.refresh();
    } else {
      setMessage({ text: res.error, type: 'error' });
    }
    setIsCreating(false);
  };

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <AdminPageHeader
        title="Genres"
        description="Manage the genres used by the content catalog"
      />

      <AdminCard className="p-6">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={GENRE_SEARCH_PLACEHOLDER}
              aria-label="Filter genres"
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg pl-10 pr-3 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {message && (
              <span
                role="status"
                className={`text-xs font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
              >
                {message.text}
              </span>
            )}
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={GENRE_NAME_PLACEHOLDER}
              aria-label="New genre name"
              className="w-full md:w-56 h-10 bg-black/40 border border-white/10 rounded-lg px-3.5 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50"
            />
            <button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors duration-200 cursor-pointer focus-ring disabled:opacity-40 disabled:pointer-events-none"
            >
              <PlusIcon className="w-4 h-4" />
              {isCreating ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-white/80">
              {search ? 'No genres match your filter.' : 'No genres yet.'}
            </p>
            {!search && <p className="mt-1 text-xs text-white/50">Create your first genre with the field above.</p>}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
