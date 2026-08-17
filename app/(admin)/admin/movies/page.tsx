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
    <div className="animate-in fade-in duration-500 w-full text-white font-sans">

      {/* Page Title (Optional, the screenshot doesn't show one, but good to have) */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Movies</h1>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl shadow-sm flex flex-col">

        {/* Top Toolbar */}
        <div className="p-3 px-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search movies..." className="bg-[#000000] border border-white/5 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 text-white w-64 transition-colors" />
            </div>

            {/* Filters */}
            <div className="relative">
              <select className="appearance-none bg-[#000000] border border-white/5 rounded-md pl-4 pr-8 py-2 text-sm focus:outline-none focus:border-red-500 text-white cursor-pointer transition-colors">
                <option>All genres</option>
                <option>Action</option>
                <option>Comedy</option>
              </select>
              <svg className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            <div className="relative">
              <select className="appearance-none bg-[#000000] border border-white/5 rounded-md pl-4 pr-8 py-2 text-sm focus:outline-none focus:border-red-500 text-white cursor-pointer transition-colors">
                <option>All statuses</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
              <svg className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div>
            <Link href="/admin/movies/create" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add movie
            </Link>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-semibold border-b border-white/5">
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors w-full">
                  <div className="flex items-center gap-2">Movie <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                  <div className="flex items-center gap-2">Genre <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                  <div className="flex items-center gap-2">Release Date <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                  <div className="flex items-center gap-2">View Count <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {movies.length > 0 ? movies.map((movie: any) => (
                <tr key={movie.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">

                  {/* Movie Column (Like User in screenshot) */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar / Poster */}
                      <div className="w-9 h-9 rounded-full bg-[#1E1E2D] border border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-400 shrink-0 overflow-hidden">
                        {movie.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
                        ) : movie.title.charAt(0)}
                      </div>
                      <div className="flex flex-col justify-center gap-0.5">
                        <div className="font-medium text-[13px] text-white leading-tight">{movie.title}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">{movie.tmdb_id ? `tmdb-${movie.tmdb_id}` : `id-${movie.id}`}</div>
                      </div>
                    </div>
                  </td>

                  {/* Genre Column (Like Role badge) */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">
                      {movie.genres && movie.genres.length > 0 ? movie.genres[0].name : 'Uncategorized'}
                    </span>
                  </td>

                  {/* Release Date Column (Like Joined) */}
                  <td className="py-2.5 px-4 text-white/80 font-medium text-[12px] whitespace-nowrap">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>

                  {/* View Count Column (Like Last Sign In) */}
                  <td className="py-2.5 px-4 text-gray-400 text-[12px] whitespace-nowrap">
                    {movie.views > 0 ? movie.views.toLocaleString() : '-'}
                  </td>

                  {/* Arrow/Actions Column */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/movies/${movie.id}`} className="text-white/50 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium">Edit</Link>
                      <DeleteButton id={movie.id} type="movies" />
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No movies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Toolbar */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span>Rows per page</span>
            <div className="relative">
              <select className="appearance-none bg-[#000000] border border-white/5 rounded pl-2 pr-6 py-1 focus:outline-none focus:border-red-500 text-white cursor-pointer transition-colors">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <svg className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span>1 - {Math.min(10, movies.length)} of {movies.length}</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors disabled:opacity-50" disabled>&lt;</button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-white/10 text-white font-medium">1</button>
              {movies.length > 10 && <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors">2</button>}
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors disabled:opacity-50" disabled={movies.length <= 10}>&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SortIcon() {
  return (
    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}
