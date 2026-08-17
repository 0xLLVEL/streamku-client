import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';

async function getGenres() {
  const res = await fetchApi('/admin/genres', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function AdminGenresPage() {
  const genres = await getGenres();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight drop-shadow-sm">Genres</h1>
          <p className="text-white/40 text-sm mt-1">Manage content categories.</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Add Genre
        </button>
      </div>

      {/* Table Container */}
      <div className="liquid-glass rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-black/40 backdrop-blur-md border-b border-white/5 text-xs uppercase font-medium text-white/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-white">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {genres.length > 0 ? genres.map((genre: any) => (
                <tr key={genre.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs">{genre.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{genre.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white/40">{genre.slug}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link href={`/admin/genres/${genre.id}`} className="text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/5 hover:bg-white/10 transition-all text-xs font-medium">Edit</Link>
                      <DeleteButton id={genre.id} type="genres" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                    No genres found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
          <span>Showing {genres.length} genres</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-white/10 rounded-md hover:bg-white/5 transition-colors opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 border border-white/10 rounded-md hover:bg-white/5 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
