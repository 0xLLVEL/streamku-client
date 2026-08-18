"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  updateMovieAction,
  createMovieAction,
  importMovieFromTmdbAction,
  searchTmdbAction,
  deleteVideoAction,
  previewTmdbMovieAction,
} from "@/app/actions/admin-content";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoCreateForm } from "@/components/admin/VideoCreateForm";
import Link from "next/link";

export function MovieEditForm({ movie }: { movie?: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("primary_facts");
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const displayData = previewData || movie;
  const existingVideoQualityIds =
    movie?.media
      ?.filter((m: any) => m.type === "video" && m.quality?.id)
      .map((m: any) => Number(m.quality.id)) || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

  const updateDropdownRect = () => {
    if (inputRef.current) {
      setDropdownRect(inputRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    const handleScroll = () => {
      if (showDropdown) updateDropdownRect();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showDropdown]);

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
      const res = await searchTmdbAction(query, "movie");
      if (res.success) {
        setSearchResults(res.results.slice(0, 5));
      }
      setIsSearching(false);
    }, 400);
  };

  const selectSearchResult = async (tmdbId: number) => {
    setShowDropdown(false);
    setSearchQuery("");
    await handleTmdbImport(tmdbId.toString());
  };

  const handleTmdbImport = async (tmdbId: string) => {
    if (!tmdbId) return;

    setIsImporting(true);
    setMessage(null);

    const res = await previewTmdbMovieAction(tmdbId);

    if (res.success && res.data) {
      const data = res.data;
      const trailerUrl = data.videos?.results?.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube",
      )?.key
        ? `https://www.youtube.com/watch?v=${data.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube").key}`
        : null;

      const formattedData = {
        id: null,
        tmdb_id: data.id,
        title: data.title,
        overview: data.overview,
        tagline: data.tagline,
        trailer_url: trailerUrl,
        release_date: data.release_date,
        runtime: data.runtime,
        popularity: data.popularity,
        original_language: data.original_language,
        status: data.status,
        genres: data.genres,
        cast: data.credits?.cast || [],
        images: data.images,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
      };
      setPreviewData(formattedData);
      setMessage({
        text: "Movie data loaded for preview. Review fields and click Save.",
        type: "success",
      });
      setIsImporting(false);
    } else {
      setMessage({
        text: res.error || "Failed to import preview",
        type: "error",
      });
      setIsImporting(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      let targetId = movie?.id;

      if (!targetId && previewData?.tmdb_id) {
        const importRes = await importMovieFromTmdbAction(previewData.tmdb_id);
        if (!importRes.success) {
          throw new Error(importRes.error || "Failed to import TMDB data");
        }
        targetId = importRes.id;
      }

      const res = targetId
        ? await updateMovieAction(targetId, formData)
        : await createMovieAction(formData);

      if (!res.success) {
        throw new Error(res.error || "Failed to save movie");
      }

      return { res, targetId };
    },
    onSuccess: ({ res, targetId }) => {
      setMessage({ text: "Movie saved successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });

      setTimeout(() => {
        setMessage(null);
        if (!movie?.id && (targetId || (res as any).id)) {
          router.push(`/admin/movies/${targetId || (res as any).id}`);
        }
      }, 2000);
    },
    onError: (error: Error) => {
      setMessage({ text: error.message, type: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.get("is_featured")) {
      formData.set("is_featured", "");
    }

    saveMutation.mutate(formData);
  };

  const tabs = [
    { id: "primary_facts", label: "Overview" },
    { id: "seasons", label: "Seasons", hidden: true }, // Not for movies
    { id: "images", label: "Images" },
    { id: "videos", label: "Streams" },
    { id: "cast", label: "Cast" },
    { id: "reviews", label: "Reviews" },
    { id: "comments", label: "Comments" },
  ];

  const handleDeleteVideo = async (videoId: number) => {
    if (!movie?.id) return;
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await deleteVideoAction(movie.id, videoId);
      if (res.success) {
        setMessage({ text: "Video deleted successfully!", type: "success" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          text: res.error || "Failed to delete video",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred.", type: "error" });
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!movie?.id) return;
    if (!confirm("Are you sure you want to delete this image?")) return;
    // Mock deletion for images
    setMessage({
      text: "Image deletion is not implemented in this demo.",
      type: "error",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-[100vh] -m-6 md:-m-8 overflow-hidden relative"
    >
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/movies"
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">
            {movie ? `Edit "${movie.title}"` : "Create Movie"}
          </h1>
          {movie && (
            <a
              href={`/movies/${movie.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-white/30 hover:text-white transition-colors ml-2"
              title="View on site"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          {message && (
            <span
              className={`text-sm font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-medium text-sm transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 overflow-y-auto bg-transparent py-6">
          <nav className="flex flex-col px-4 space-y-2">
            {tabs
              .filter((t) => !t.hidden)
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-4 py-2 rounded-md transition-colors duration-150 text-[13px] font-medium ${
                    activeTab === tab.id
                      ? "bg-red-500/10 text-red-500 shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </nav>
        </div>

        <div
          className="flex-1 overflow-y-auto p-8 bg-transparent"
          key={displayData?.tmdb_id || displayData?.id || "new"}
        >
          {/* PRIMARY FACTS TAB */}
          {activeTab === "primary_facts" && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
              {!movie && (
                <div className="relative bg-gradient-to-br from-red-600/10 via-red-500/5 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md group">
                  {/* Decorative blur blob */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors duration-700"></div>
                  </div>
                  
                  <div className="flex flex-row items-center gap-5 relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/20 border border-white/10 shadow-inner">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        Import from TMDB
                      </h3>
                      <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                        Enter a TMDB ID to automatically fetch all details,
                        posters, backdrops, and cast.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-4 w-full md:w-[50%] relative z-10">
                    {/* Search Field */}
                    <div className="relative" ref={dropdownRef}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-white/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => {
                          updateDropdownRect();
                          if (searchQuery) setShowDropdown(true);
                        }}
                        placeholder="Search for a movie..."
                        className="w-full bg-[#000000] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/20 focus:outline-none transition-all placeholder:text-white/20"
                      />

                      {/* Dropdown – rendered via portal so it's always on top */}
                      {showDropdown && (searchQuery || isSearching) && dropdownRect &&
                        createPortal(
                          <div
                            ref={dropdownRef}
                            style={{
                              position: "fixed",
                              top: dropdownRect.bottom + 8,
                              left: dropdownRect.left,
                              width: dropdownRect.width,
                              zIndex: 9999,
                            }}
                            className="bg-[#0a0a0a] border border-red-500/20 rounded-xl shadow-[0_8px_30px_rgb(220,38,38,0.15)] overflow-hidden"
                          >
                            {isSearching ? (
                              <div className="p-4 text-sm text-white/50 text-center">
                                Searching...
                              </div>
                            ) : searchResults.length > 0 ? (
                              <ul className="max-h-64 overflow-y-auto">
                                {searchResults.map((result) => (
                                  <li key={result.id}>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectSearchResult(result.id);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                                    >
                                      {result.poster_path ? (
                                        <img
                                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                                          alt=""
                                          className="w-8 h-12 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center text-[10px] text-white/30">
                                          No img
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                          {result.title}
                                        </p>
                                        <p className="text-xs text-white/40 truncate">
                                          {result.release_date
                                            ? result.release_date.split("-")[0]
                                            : "N/A"}{" "}
                                          • TMDB ID: {result.id}
                                        </p>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-sm text-white/50 text-center">
                                No results found.
                              </div>
                            )}
                          </div>,
                          document.body
                        )
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Image Previews */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Poster
                  </label>
                  <div className="aspect-[2/3] bg-white/5 rounded-lg border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
                    {displayData?.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${displayData.poster_path}`}
                        alt="Poster"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity"
                      />
                    )}
                    <button
                      type="button"
                      className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Replace image
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[#ff4b4b] text-xs font-medium mt-3 hover:underline"
                  >
                    Remove image
                  </button>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Backdrop
                  </label>
                  <div className="aspect-video bg-white/5 rounded-lg border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
                    {displayData?.backdrop_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w1280${displayData.backdrop_path}`}
                        alt="Backdrop"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity"
                      />
                    )}
                    <button
                      type="button"
                      className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Replace image
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={displayData?.title || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_title">Original title</Label>
                  <Input
                    id="original_title"
                    name="original_title"
                    defaultValue={displayData?.original_title || ""}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={displayData?.is_featured || false}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4b4b]"></div>
                    <span className="ml-3 text-sm font-medium text-white/70">
                      Featured Movie
                    </span>
                  </label>
                </div>
              </div>

              {/* Genres Section inline in Overview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-medium text-white/50">
                    Genres
                  </label>
                  <button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                    Add Genre
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayData?.genres?.map((genre: any) => (
                    <div
                      key={genre.id}
                      className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded text-[13px] font-medium flex items-center gap-2"
                    >
                      {genre.name}
                      <button type="button" className="hover:text-red-400">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(!displayData?.genres ||
                    displayData.genres.length === 0) && (
                    <p className="text-white/50 text-sm">No genres assigned.</p>
                  )}
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="release_date">Release date</Label>
                  <Input
                    type="date"
                    id="release_date"
                    name="release_date"
                    defaultValue={
                      displayData?.release_date
                        ? displayData.release_date.split("T")[0]
                        : ""
                    }
                    className="[color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    defaultValue={displayData?.tagline || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailer_url">Trailer URL (YouTube)</Label>
                  <Input
                    type="url"
                    id="trailer_url"
                    name="trailer_url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    defaultValue={displayData?.trailer_url || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overview">Overview</Label>
                  <Textarea
                    id="overview"
                    name="overview"
                    defaultValue={displayData?.overview || ""}
                    rows={4}
                  />
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="runtime">Runtime (minutes)</Label>
                  <Input
                    type="number"
                    id="runtime"
                    name="runtime"
                    defaultValue={displayData?.runtime || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={displayData?.status || "Released"}
                  >
                    <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem
                        value="Released"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Released
                      </SelectItem>
                      <SelectItem
                        value="Post Production"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Post Production
                      </SelectItem>
                      <SelectItem
                        value="Rumored"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Rumored
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popularity">Popularity</Label>
                  <Input
                    type="number"
                    step="0.1"
                    id="popularity"
                    name="popularity"
                    defaultValue={displayData?.popularity || 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_language">Language</Label>
                  <Select
                    name="original_language"
                    defaultValue={displayData?.original_language || "en"}
                  >
                    <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem
                        value="en"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        English
                      </SelectItem>
                      <SelectItem
                        value="es"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Spanish
                      </SelectItem>
                      <SelectItem
                        value="fr"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        French
                      </SelectItem>
                      <SelectItem
                        value="ja"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Japanese
                      </SelectItem>
                      <SelectItem
                        value="ko"
                        className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5"
                      >
                        Korean
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === "images" && (
            <div className="max-w-6xl space-y-12 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Backdrops (
                    {displayData?.images?.backdrops?.length ||
                      (displayData?.backdrop_path ? 1 : 0)}
                    )
                  </h2>
                  <button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                    Add Backdrop
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayData?.images?.backdrops
                    ?.slice(0, 12)
                    .map((img: any, i: number) => (
                      <div
                        key={i}
                        className="aspect-video bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group/preview cursor-pointer"
                        onClick={() =>
                          setPreviewImage(
                            `https://image.tmdb.org/t/p/original${img.file_path}`,
                          )
                        }
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                          className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                          alt="Backdrop"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(img.id);
                          }}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                          title="Delete image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )) ||
                    (displayData?.backdrop_path && (
                      <div
                        className="aspect-video bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group/preview cursor-pointer"
                        onClick={() =>
                          setPreviewImage(
                            `https://image.tmdb.org/t/p/original${displayData.backdrop_path}`,
                          )
                        }
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w780${displayData.backdrop_path}`}
                          className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                          alt="Backdrop"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(displayData.id);
                          }}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                          title="Delete image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )) || (
                      <p className="text-white/50 col-span-full">
                        No backdrops available.
                      </p>
                    )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Posters (
                    {displayData?.images?.posters?.length ||
                      (displayData?.poster_path ? 1 : 0)}
                    )
                  </h2>
                  <button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                    Add Poster
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {displayData?.images?.posters
                    ?.slice(0, 12)
                    .map((img: any, i: number) => (
                      <div
                        key={i}
                        className="aspect-[2/3] bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group/preview cursor-pointer"
                        onClick={() =>
                          setPreviewImage(
                            `https://image.tmdb.org/t/p/original${img.file_path}`,
                          )
                        }
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                          className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                          alt="Poster"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(img.id);
                          }}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                          title="Delete image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )) ||
                    (displayData?.poster_path && (
                      <div
                        className="aspect-[2/3] bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative group/preview cursor-pointer"
                        onClick={() =>
                          setPreviewImage(
                            `https://image.tmdb.org/t/p/original${displayData.poster_path}`,
                          )
                        }
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${displayData.poster_path}`}
                          className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                          alt="Poster"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(displayData.id);
                          }}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                          title="Delete image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )) || (
                      <p className="text-white/50 col-span-full">
                        No posters available.
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === "videos" && (
            <div className="max-w-[1600px] w-full animate-in fade-in duration-300">
              {isAddingVideo && movie?.id ? (
                <VideoCreateForm
                  mediableId={movie.id}
                  mediableType="movie"
                  parentTitle={movie.title || "Unknown Title"}
                  parentPoster={movie.poster_path}
                  onClose={() => setIsAddingVideo(false)}
                  existingVideoQualityIds={existingVideoQualityIds}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Streams ({displayData?.media?.length || 0})
                    </h2>
                    {movie?.id && (
                      <button
                        type="button"
                        onClick={() => setIsAddingVideo(true)}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          ></path>
                        </svg>
                        Upload Stream
                      </button>
                    )}
                  </div>

                  {!movie?.id && (
                    <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                      <p className="text-sm text-white/50">
                        Please save the movie first before uploading streams.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Uploaded streams will be displayed here */}
                    {(!displayData?.media ||
                      displayData.media.length === 0) && (
                      <p className="text-white/50 col-span-full">
                        No streams available.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CAST TAB */}
          {activeTab === "cast" && (
            <div className="max-w-6xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Cast ({displayData?.cast?.length || 0})
                </h2>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                  Add Cast Member
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-xl border border-white/5 bg-[#050505] overflow-hidden">
                {displayData?.cast?.map((person: any) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 py-2.5 px-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 border-r border-white/5 group"
                  >
                    <div className="w-9 h-9 shrink-0 bg-[#1e1e24] rounded-full overflow-hidden">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          className="w-full h-full object-cover"
                          alt={person.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px]">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-[13px] text-white truncate"
                        title={person.name}
                      >
                        {person.name}
                      </p>
                      <p
                        className="text-white/40 text-[11px] truncate mt-0.5"
                        title={person.character}
                      >
                        {person.character}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      <button
                        type="button"
                        className="text-white/30 hover:text-red-400 p-1"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {(!displayData?.cast || displayData.cast.length === 0) && (
                  <div className="col-span-full p-8 text-center text-white/50 text-sm">
                    No cast available.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDERS (Reviews, Comments) */}
          {["reviews", "comments"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-white/30 animate-in fade-in duration-300">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <h2 className="text-xl font-medium mb-2">
                {tabs.find((t) => t.id === activeTab)?.label} Manager
              </h2>
              <p className="text-sm text-center max-w-sm">
                This section is currently under construction. You will be able
                to manage {activeTab} here in a future update.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <div className="relative max-w-full max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </form>
  );
}
