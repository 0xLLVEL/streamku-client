'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createGenreAction } from '@/app/actions/admin-content';
import { AdminCard, AdminPageHeader } from '@/components/admin/ui';
import { DeleteButton } from '@/components/admin/lists/DeleteButton';

export type GenreType = {
  id: number;
  name: string;
  slug: string;
};

/** Genre management as a searchable tile grid with inline create. */
export function GenresClient({ initialGenres }: { initialGenres: GenreType[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const genres = initialGenres;
  const visible = genres.filter((genre) =>
    genre.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setIsCreating(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    const res = await createGenreAction(formData);

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
        {/* Toolbar */}
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter genres..."
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
              placeholder="New genre name..."
              aria-label="New genre name"
              className="w-full md:w-56 h-10 bg-black/40 border border-white/10 rounded-lg px-3.5 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50"
            />
            <button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors duration-200 cursor-pointer focus-ring disabled:opacity-40 disabled:pointer-events-none"
            >
              <PlusIcon />
              {isCreating ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {/* Tile grid */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((genre) => (
              <div
                key={genre.id}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition-colors duration-200 hover:border-white/20 hover:bg-black/50"
              >
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

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}
