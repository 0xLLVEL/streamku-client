import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';

async function getMovies() {
  const res = await fetchApi('/admin/movies', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function AdminMoviesPage() {
  const movies = await getMovies();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight drop-shadow-sm">Movies</h1>
          <p className="text-white/40 text-sm mt-1">Manage movie catalog.</p>
        </div>
      </div>

      <div className="liquid-glass rounded-xl shadow-sm flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">All Movies</h2>
          <span className="text-xs font-bold bg-white/5 text-white/50 px-2 py-1 rounded">{movies.length} entries</span>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-black/40 backdrop-blur-md border-b border-white/5 text-[10px] uppercase font-bold text-white/40 tracking-widest">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Release Date</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4">View Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movies.length > 0 ? movies.map((movie: any) => (
                <tr key={movie.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-black rounded-lg shadow overflow-hidden shrink-0 border border-white/10">
                        {movie.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
                        ) : <div className="w-full h-full bg-white/5"></div>}
                      </div>
                      <div>
                        <p className="text-white font-medium line-clamp-1 text-base">{movie.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{new Date(movie.release_date).getFullYear()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/70">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/70">
                    {movie.updated_at ? new Date(movie.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/70">
                    {movie.views?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link href={`/admin/movies/${movie.id}`} className="text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/5 hover:bg-white/10 transition-all text-xs font-medium">Edit</Link>
                      <DeleteButton id={movie.id} type="movies" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">No movies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
