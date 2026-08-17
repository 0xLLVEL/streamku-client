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
    <div className="animate-in fade-in duration-500 w-full text-white font-sans">
      
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Genres</h1>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl shadow-sm flex flex-col">
        
        {/* Top Toolbar */}
        <div className="p-3 px-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search genres..." className="bg-[#000000] border border-white/5 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 text-white w-64 transition-colors" />
            </div>
          </div>

          <div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add genre
            </button>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-semibold border-b border-white/5">
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors w-full">
                  <div className="flex items-center gap-2">Genre <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                  <div className="flex items-center gap-2">Slug <SortIcon /></div>
                </th>
                <th className="py-2.5 px-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {genres.length > 0 ? genres.map((genre: any) => (
                <tr key={genre.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col justify-center gap-0.5">
                      <div className="font-medium text-[13px] text-white leading-tight">{genre.name}</div>
                      <div className="text-[11px] text-gray-500 leading-tight">id-{genre.id}</div>
                    </div>
                  </td>
                  
                  <td className="py-2.5 px-4 text-gray-400 text-[12px] whitespace-nowrap">
                    {genre.slug}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/genres/${genre.id}`} className="text-white/50 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:bg-white/10 transition-colors text-[11px] font-medium">Edit</Link>
                      <DeleteButton id={genre.id} type="genres" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No genres found.
                  </td>
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
              <select className="appearance-none bg-transparent border-none focus:outline-none cursor-pointer pr-4 text-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <svg className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span>1 - {Math.min(10, genres.length)} of {genres.length}</span>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:text-white transition-colors cursor-not-allowed opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
              <button className="p-1 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
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
