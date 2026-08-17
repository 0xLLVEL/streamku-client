'use client';

import { useState } from 'react';
import { importTmdbAction } from '@/app/actions/admin';

export default function TmdbImportPage() {
  const [tmdbId, setTmdbId] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tmdbId || isNaN(Number(tmdbId))) {
      setMessage({ text: 'Please enter a valid numeric TMDB ID', type: 'error' });
      return;
    }

    setIsImporting(true);
    setMessage({ text: 'Importing content, please wait...', type: 'info' });

    try {
      const res = await importTmdbAction(parseInt(tmdbId, 10), type);

      if (res.success) {
        setMessage({ 
          text: `Successfully imported ${type === 'movie' ? 'Movie' : 'TV Show'}: ${res.data?.title || res.data?.name || tmdbId}`, 
          type: 'success' 
        });
        setTmdbId(''); // Clear form on success
      } else {
        setMessage({ text: res.error || 'Failed to import content', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred during import.', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm mb-2">TMDB Importer</h1>
        <p className="text-gray-400">Instantly fetch and ingest full metadata, cast, videos, and posters from TMDB.</p>
      </div>

      <div className="liquid-glass rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] pointer-events-none" />

        <form onSubmit={handleImport} className="relative z-10 space-y-8">
          
          {message && (
            <div className={`p-4 rounded-xl border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
              message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <div className="flex items-center gap-3 font-medium">
                {message.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                {message.type === 'error' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                {message.type === 'info' && <span className="animate-pulse">⏳</span>}
                {message.text}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Content Type Toggle */}
            <div>
              <label className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Content Type</label>
              <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setType('movie')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    type === 'movie' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎬 Movie
                </button>
                <button
                  type="button"
                  onClick={() => setType('tv')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    type === 'tv' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📺 TV Series
                </button>
              </div>
            </div>

            {/* TMDB ID Input */}
            <div>
              <label htmlFor="tmdbId" className="block text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">
                TMDB ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tmdbId"
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value)}
                  placeholder="e.g., 550 for Fight Club"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-lg"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Find the ID in the URL of the TMDB page (e.g., themoviedb.org/movie/<strong>550</strong>)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isImporting}
              className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-3"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Execute Import
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
