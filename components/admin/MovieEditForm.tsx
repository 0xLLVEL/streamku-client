'use client';

import { useState } from 'react';
import { updateMovieAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function MovieEditForm({ movie }: { movie: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('primary_facts');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.get('is_featured')) {
      formData.set('is_featured', '');
    }

    const res = await updateMovieAction(movie.id, formData);

    if (res.success) {
      setMessage({ text: 'Movie updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      setIsSaving(false);
    } else {
      setMessage({ text: res.error || 'Failed to update', type: 'error' });
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'primary_facts', label: 'Overview' },
    { id: 'seasons', label: 'Seasons', hidden: true }, // Not for movies
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'cast', label: 'Cast' },
    { id: 'crew', label: 'Crew' },
    { id: 'genres', label: 'Genres' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'countries', label: 'Countries' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[100vh] -m-6 md:-m-8">
      
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/movies" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">Edit &ldquo;{movie.title}&rdquo;</h1>
          <a href={`/movies/${movie.slug}`} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors ml-2" title="View on site">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={isSaving} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-medium text-sm transition-all disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 overflow-y-auto bg-transparent py-6">
          <nav className="flex flex-col px-4 space-y-1">
            {tabs.filter(t => !t.hidden).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'bg-red-600/10 text-red-500 border border-red-500/20 shadow-[inset_4px_0_0_0_rgb(220,38,38)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Form Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-transparent">
          
          {/* PRIMARY FACTS TAB */}
          {activeTab === 'primary_facts' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
              
              {/* Image Previews */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
                  <div className="aspect-[2/3] bg-[#2a2a32] rounded border border-white/10 flex items-center justify-center relative group overflow-hidden">
                    {movie.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt="Poster" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    )}
                    <button type="button" className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Replace image
                    </button>
                  </div>
                  <button type="button" className="text-[#ff4b4b] text-xs font-medium mt-3 hover:underline">Remove image</button>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-2">Backdrop</label>
                  <div className="aspect-video bg-[#2a2a32] rounded border border-white/10 flex items-center justify-center relative group overflow-hidden">
                    {movie.backdrop_path && (
                      <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt="Backdrop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    )}
                    <button type="button" className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Replace image
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={movie.title} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Original title</label>
                  <input type="text" name="original_title" defaultValue={movie.title} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors" />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_featured" defaultChecked={movie.is_featured} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4b4b]"></div>
                    <span className="ml-3 text-sm font-medium text-white/70">Featured Movie</span>
                  </label>
                </div>
              </div>

              {/* Metadata Fields */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Release date</label>
                <div className="relative">
                  <input type="date" name="release_date" defaultValue={movie.release_date ? movie.release_date.split('T')[0] : ''} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Tagline</label>
                <input type="text" name="tagline" defaultValue={movie.tagline} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Overview</label>
                <textarea name="overview" defaultValue={movie.overview} rows={4} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors resize-y" />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Runtime (minutes)</label>
                  <input type="number" name="runtime" defaultValue={movie.runtime} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Status</label>
                  <select name="status" defaultValue={movie.status || 'Released'} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors appearance-none">
                    <option value="Released">Released</option>
                    <option value="Post Production">Post Production</option>
                    <option value="Rumored">Rumored</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Popularity</label>
                  <input type="number" step="0.1" name="popularity" defaultValue={movie.popularity} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Language</label>
                  <select name="original_language" defaultValue={movie.original_language || 'en'} className="w-full bg-transparent border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:border-[#ff4b4b] focus:outline-none focus:bg-[#25252d] transition-colors appearance-none">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Backdrops ({movie.images?.backdrops?.length || (movie.backdrop_path ? 1 : 0)})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movie.images?.backdrops?.slice(0, 12).map((img: any, i: number) => (
                    <div key={i} className="aspect-video bg-[#2a2a32] rounded-xl border border-white/10 overflow-hidden relative group">
                      <img src={`https://image.tmdb.org/t/p/w780${img.file_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Backdrop" />
                    </div>
                  )) || (movie.backdrop_path && (
                    <div className="aspect-video bg-[#2a2a32] rounded-xl border border-white/10 overflow-hidden relative group">
                      <img src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Backdrop" />
                    </div>
                  )) || (
                    <p className="text-white/50 col-span-full">No backdrops available.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-6">Posters ({movie.images?.posters?.length || (movie.poster_path ? 1 : 0)})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {movie.images?.posters?.slice(0, 12).map((img: any, i: number) => (
                    <div key={i} className="aspect-[2/3] bg-[#2a2a32] rounded-xl border border-white/10 overflow-hidden relative group">
                      <img src={`https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Poster" />
                    </div>
                  )) || (movie.poster_path && (
                    <div className="aspect-[2/3] bg-[#2a2a32] rounded-xl border border-white/10 overflow-hidden relative group">
                      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Poster" />
                    </div>
                  )) || (
                    <p className="text-white/50 col-span-full">No posters available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div className="max-w-6xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Videos ({movie.videos?.length || 0})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movie.videos?.map((video: any) => (
                  <div key={video.id} className="bg-[#2a2a32] rounded-xl overflow-hidden border border-white/10 flex flex-col">
                    <div className="aspect-video relative">
                       {video.site === 'YouTube' ? (
                         <iframe src={`https://www.youtube.com/embed/${video.key}`} className="w-full h-full" allowFullScreen></iframe>
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-black text-white/50">Preview not supported</div>
                       )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-white truncate text-sm" title={video.name}>{video.name}</p>
                      <span className="text-xs text-red-400 font-bold uppercase">{video.type}</span>
                    </div>
                  </div>
                ))}
                {(!movie.videos || movie.videos.length === 0) && (
                  <p className="text-white/50 col-span-full">No videos available.</p>
                )}
              </div>
            </div>
          )}

          {/* CAST TAB */}
          {activeTab === 'cast' && (
             <div className="max-w-6xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Cast ({movie.cast?.length || 0})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {movie.cast?.map((person: any) => (
                   <div key={person.id} className="bg-[#2a2a32] rounded-xl overflow-hidden border border-white/10 flex flex-col">
                     <div className="aspect-[2/3] bg-[#1e1e24] relative">
                       {person.profile_path ? (
                         <img src={`https://image.tmdb.org/t/p/w300${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/20">No Photo</div>
                       )}
                     </div>
                     <div className="p-3">
                       <p className="font-bold text-white text-sm truncate" title={person.name}>{person.name}</p>
                       <p className="text-white/50 text-xs truncate" title={person.character}>{person.character}</p>
                     </div>
                   </div>
                 ))}
                 {(!movie.cast || movie.cast.length === 0) && (
                  <p className="text-white/50 col-span-full">No cast members available.</p>
                )}
              </div>
             </div>
          )}

          {/* GENRES TAB */}
          {activeTab === 'genres' && (
            <div className="max-w-4xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Genres</h2>
              <div className="flex flex-wrap gap-3">
                {movie.genres?.map((genre: any) => (
                  <div key={genre.id} className="bg-red-600/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-full text-sm font-medium">
                    {genre.name}
                  </div>
                ))}
                {(!movie.genres || movie.genres.length === 0) && (
                  <p className="text-white/50">No genres assigned.</p>
                )}
              </div>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDERS (Crew, Keywords, Countries, Reviews, Comments) */}
          {['crew', 'keywords', 'countries', 'reviews', 'comments'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-white/30 animate-in fade-in duration-300">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <h2 className="text-xl font-medium mb-2">{tabs.find(t => t.id === activeTab)?.label} Manager</h2>
              <p className="text-sm text-center max-w-sm">This section is currently under construction. You will be able to manage {activeTab} here in a future update.</p>
            </div>
          )}

        </div>
      </div>
    </form>
  );
}
