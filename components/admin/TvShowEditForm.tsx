'use client';

import { useState, useRef, useEffect } from 'react';
import { updateTvShowAction, createTvShowAction, importTvShowFromTmdbAction, searchTmdbAction, previewTmdbTvAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export function TvShowEditForm({ tvShow }: { tvShow?: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('primary_facts');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const displayData = previewData || tvShow;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchTmdbAction(query, 'tv');
      if (res.success) {
        setSearchResults(res.results.slice(0, 5));
      }
      setIsSearching(false);
    }, 400);
  };

  const selectSearchResult = (tmdbId: number) => {
    const input = document.getElementById('tmdb_id_input') as HTMLInputElement;
    if (input) input.value = tmdbId.toString();
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleTmdbImport = async () => {
    const input = document.getElementById('tmdb_id_input') as HTMLInputElement;
    if (!input || !input.value) return;

    setIsImporting(true);
    setMessage(null);

    const res = await previewTmdbTvAction(input.value);

    if (res.success && res.data) {
      const data = res.data;
      const formattedData = {
        id: null,
        tmdb_id: data.id,
        name: data.name,
        overview: data.overview,
        tagline: data.tagline,
        first_air_date: data.first_air_date,
        last_air_date: data.last_air_date,
        episode_run_time: data.episode_run_time?.[0] || null,
        number_of_seasons: data.number_of_seasons,
        number_of_episodes: data.number_of_episodes,
        popularity: data.popularity,
        original_language: data.original_language,
        status: data.status,
        type: data.type,
        genres: data.genres,
        cast: data.credits?.cast || [],
        videos: data.videos?.results || [],
        images: data.images,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        seasons: data.seasons || [],
      };
      setPreviewData(formattedData);
      setMessage({ text: 'TV Show data loaded for preview. Review fields and click Save.', type: 'success' });
      setIsImporting(false);
    } else {
      setMessage({ text: res.error || 'Failed to import preview', type: 'error' });
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.get('is_featured')) {
      formData.set('is_featured', '');
    }

    let targetId = tvShow?.id;

    if (!targetId && previewData?.tmdb_id) {
      const importRes = await importTvShowFromTmdbAction(previewData.tmdb_id);
      if (!importRes.success) {
        setMessage({ text: importRes.error || 'Failed to import TMDB data', type: 'error' });
        setIsSaving(false);
        return;
      }
      targetId = importRes.id;
    }

    const res = targetId
      ? await updateTvShowAction(targetId, formData)
      : await createTvShowAction(formData);

    if (res.success) {
      setMessage({ text: 'TV Show saved successfully!', type: 'success' });
      setTimeout(() => {
        setMessage(null);
        if (!tvShow?.id && (targetId || (res as any).id)) {
          router.push(`/admin/tv-shows/${targetId || (res as any).id}`);
        }
      }, 1500);
    } else {
      setMessage({ text: res.error || 'Failed to save', type: 'error' });
    }
    setIsSaving(false);
  };

  const tabs = [
    { id: 'primary_facts', label: 'Overview' },
    { id: 'seasons', label: 'Seasons' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'cast', label: 'Cast' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[100vh] -m-6 md:-m-8">

      {/* Sticky Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/tv-shows" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">{tvShow ? `Edit "${tvShow.name}"` : 'Create TV Show'}</h1>
          {tvShow && (
            <a href={`/tv-shows/${tvShow.slug}`} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors ml-2" title="View on site">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          )}
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
          <nav className="flex flex-col px-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2 rounded-md transition-colors duration-150 text-[13px] font-medium ${activeTab === tab.id
                    ? 'bg-red-500/10 text-red-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Form Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-transparent" key={displayData?.tmdb_id || displayData?.id || 'new'}>

          {/* PRIMARY FACTS TAB */}
          {activeTab === 'primary_facts' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">

              {!tvShow && (
                <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-white">Import from TMDB</h3>
                    <p className="text-sm text-white/50 max-w-sm leading-relaxed">Enter a TMDB ID to automatically fetch all details, seasons, posters, backdrops, and cast.</p>
                  </div>
                  <div className="flex flex-col items-stretch gap-4 w-full md:w-[60%]">

                    {/* Search Field */}
                    <div className="relative" ref={dropdownRef}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => { if (searchQuery) setShowDropdown(true); }}
                        placeholder="Search for a TV Show..."
                        className="w-full bg-[#000000] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/20 focus:outline-none transition-all placeholder:text-white/20"
                      />

                      {/* Dropdown */}
                      {showDropdown && (searchQuery || isSearching) && (
                        <div className="absolute z-50 mt-1 w-full bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                          {isSearching ? (
                            <div className="p-4 text-sm text-white/50 text-center">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto">
                              {searchResults.map((result) => (
                                <li key={result.id}>
                                  <button
                                    type="button"
                                    onClick={() => selectSearchResult(result.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                                  >
                                    {result.poster_path ? (
                                      <img src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} alt="" className="w-8 h-12 object-cover rounded" />
                                    ) : (
                                      <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center text-[10px] text-white/30">No img</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{result.name}</p>
                                      <p className="text-xs text-white/40 truncate">
                                        {result.first_air_date ? result.first_air_date.split('-')[0] : 'N/A'} • TMDB ID: {result.id}
                                      </p>
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-4 text-sm text-white/50 text-center">No results found.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full">
                      <div className="text-white/30 text-sm font-medium">OR</div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-white/30 text-sm font-mono">ID:</span>
                        </div>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" id="tmdb_id_input" placeholder="e.g. 1399" className="w-full bg-[#000000] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/20 focus:outline-none transition-all placeholder:text-white/20" />
                      </div>
                      <button type="button" onClick={handleTmdbImport} disabled={isImporting} className="bg-white/10 hover:bg-white/20 border border-white/5 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                        {isImporting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Importing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            Auto-Fill Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Previews */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
                  <div className="aspect-[2/3] bg-white/5 rounded-lg border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
                    {displayData?.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w500${displayData.poster_path}`} alt="Poster" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    )}
                    <button type="button" className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Replace image
                    </button>
                  </div>
                  <button type="button" className="text-[#ff4b4b] text-xs font-medium mt-3 hover:underline">Remove image</button>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-2">Backdrop</label>
                  <div className="aspect-video bg-white/5 rounded-lg border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
                    {displayData?.backdrop_path && (
                      <img src={`https://image.tmdb.org/t/p/w1280${displayData.backdrop_path}`} alt="Backdrop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    )}
                    <button type="button" className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Replace image
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Title</Label>
                  <Input id="name" name="name" defaultValue={displayData?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_name">Original title</Label>
                  <Input id="original_name" name="original_name" defaultValue={displayData?.original_name || displayData?.name || ''} />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_featured" defaultChecked={displayData?.is_featured || false} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4b4b]"></div>
                    <span className="ml-3 text-sm font-medium text-white/70">Featured Series</span>
                  </label>
                </div>
              </div>

              {/* Genres Section inline in Overview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-medium text-white/50">Genres</label>
                  <button type="button" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Genre
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayData?.genres?.map((genre: any) => (
                    <div key={genre.id} className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded text-[13px] font-medium flex items-center gap-2">
                      {genre.name}
                      <button type="button" className="hover:text-red-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                  {(!displayData?.genres || displayData.genres.length === 0) && (
                    <p className="text-white/50 text-sm">No genres assigned.</p>
                  )}
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="first_air_date">First air date</Label>
                  <Input type="date" id="first_air_date" name="first_air_date" defaultValue={displayData?.first_air_date ? displayData.first_air_date.split('T')[0] : ''} className="[color-scheme:dark]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" name="tagline" defaultValue={displayData?.tagline || ''} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overview">Overview</Label>
                  <Textarea id="overview" name="overview" rows={5} defaultValue={displayData?.overview || ''} />
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number_of_seasons">Number of seasons</Label>
                  <Input type="number" id="number_of_seasons" name="number_of_seasons" defaultValue={displayData?.number_of_seasons || 0} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={displayData?.status || 'Returning Series'}>
                    <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem value="Returning Series" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Returning Series</SelectItem>
                      <SelectItem value="Ended" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Ended</SelectItem>
                      <SelectItem value="Canceled" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Canceled</SelectItem>
                      <SelectItem value="In Production" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">In Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popularity">Popularity</Label>
                  <Input type="number" step="0.1" id="popularity" name="popularity" defaultValue={displayData?.popularity || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_language">Language</Label>
                  <Select name="original_language" defaultValue={displayData?.original_language || 'en'}>
                    <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem value="en" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">English</SelectItem>
                      <SelectItem value="es" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Spanish</SelectItem>
                      <SelectItem value="fr" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">French</SelectItem>
                      <SelectItem value="ja" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Japanese</SelectItem>
                      <SelectItem value="ko" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          )}

          {/* SEASONS TAB */}
          {activeTab === 'seasons' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Seasons ({displayData?.seasons?.length || 0})</h2>
                {tvShow?.id && (
                  <Link href={`/admin/tv-shows/${tvShow.id}/seasons/create`} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Season
                  </Link>
                )}
              </div>
              <div className="bg-[#050505] rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                {displayData?.seasons?.map((season: any) => {
                  const content = (
                    <>
                      <div className="w-12 shrink-0 bg-[#1e1e24] relative aspect-[2/3] rounded overflow-hidden">
                        {season.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w300${season.poster_path}`} className="w-full h-full object-cover" alt={season.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">No Photo</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm text-white truncate transition-colors ${tvShow?.id ? 'group-hover:text-red-400' : ''}`} title={season.name}>
                            {season.name}
                          </p>
                          <p className="text-white/50 text-xs mt-1 truncate">{season.episode_count} Episodes</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40 shrink-0">
                          {season.air_date && <span>{season.air_date.split('T')[0]}</span>}
                        </div>
                      </div>
                      {tvShow?.id && (
                        <div className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                      )}
                    </>
                  );

                  return tvShow?.id ? (
                    <Link href={`/admin/tv-shows/${tvShow.id}/seasons/${season.season_number}`} key={season.id} className="flex items-center gap-4 py-3 px-4 hover:bg-white/[0.02] transition-colors group">
                      {content}
                    </Link>
                  ) : (
                    <div key={season.id} className="flex items-center gap-4 py-3 px-4 transition-colors">
                      {content}
                    </div>
                  );
                })}
                {(!displayData?.seasons || displayData.seasons.length === 0) && (
                  <div className="p-8 text-center text-white/50 text-sm">No seasons available.</div>
                )}
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Backdrops ({displayData?.images?.backdrops?.length || (displayData?.backdrop_path ? 1 : 0)})</h2>
                  <button type="button" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Backdrop
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayData?.images?.backdrops?.slice(0, 12).map((img: any, i: number) => (
                    <div key={i} className="aspect-video bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(`https://image.tmdb.org/t/p/original${img.file_path}`)}>
                      <img src={`https://image.tmdb.org/t/p/w780${img.file_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Backdrop" />
                    </div>
                  )) || (displayData?.backdrop_path && (
                    <div className="aspect-video bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(`https://image.tmdb.org/t/p/original${displayData.backdrop_path}`)}>
                      <img src={`https://image.tmdb.org/t/p/w780${displayData.backdrop_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Backdrop" />
                    </div>
                  )) || (
                      <p className="text-white/50 col-span-full">No backdrops available.</p>
                    )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Posters ({displayData?.images?.posters?.length || (displayData?.poster_path ? 1 : 0)})</h2>
                  <button type="button" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Poster
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {displayData?.images?.posters?.slice(0, 12).map((img: any, i: number) => (
                    <div key={i} className="aspect-[2/3] bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(`https://image.tmdb.org/t/p/original${img.file_path}`)}>
                      <img src={`https://image.tmdb.org/t/p/w500${img.file_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Poster" />
                    </div>
                  )) || (displayData?.poster_path && (
                    <div className="aspect-[2/3] bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(`https://image.tmdb.org/t/p/original${displayData.poster_path}`)}>
                      <img src={`https://image.tmdb.org/t/p/w500${displayData.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Poster" />
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Videos ({displayData?.videos?.length || 0})</h2>
                <button type="button" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Video
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData?.videos?.map((video: any) => (
                  <div key={video.id} className="bg-[#050505] rounded-xl overflow-hidden border border-white/5 flex flex-col group hover:border-white/10 transition-colors">
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
                {(!displayData?.videos || displayData.videos.length === 0) && (
                  <p className="text-white/50 col-span-full">No videos available.</p>
                )}
              </div>
            </div>
          )}

          {/* CAST TAB */}
          {activeTab === 'cast' && (
            <div className="max-w-6xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Cast ({displayData?.cast?.length || 0})</h2>
                <button type="button" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Cast Member
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {displayData?.cast?.slice(0, 24).map((person: any) => (
                  <div key={person.id} className="flex items-center gap-3 py-2.5 px-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 border-r border-white/5 group">
                    <div className="w-9 h-9 shrink-0 bg-[#1e1e24] rounded-full overflow-hidden">
                      {person.profile_path ? (
                        <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px]">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13px] text-white truncate" title={person.name}>{person.name}</p>
                      <p className="text-white/40 text-[11px] truncate mt-0.5" title={person.character}>{person.character}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                       <button type="button" className="text-white/30 hover:text-red-400 p-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                  </div>
                ))}
                {(!displayData?.cast || displayData.cast.length === 0) && (
                  <div className="col-span-full p-8 text-center text-white/50 text-sm">No cast available.</div>
                )}
              </div>
            </div>
          )}


          {/* OTHER TABS PLACEHOLDERS (Reviews, Comments) */}
          {['reviews', 'comments'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-white/30 animate-in fade-in duration-300">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <h2 className="text-xl font-medium mb-2">{tabs.find(t => t.id === activeTab)?.label} Manager</h2>
              <p className="text-sm text-center max-w-sm">This section is currently under construction. You will be able to manage {activeTab} here in a future update.</p>
            </div>
          )}

        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <button 
            type="button" 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="relative max-w-full max-h-full">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

    </form>
  );
}
