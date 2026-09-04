/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { syncWatchProgress } from '@/lib/watchHistory';

interface EpisodeNav {
  label: string;
  name: string;
  onClick: () => void;
}

interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onBack?: () => void;
  watchableId?: number;
  watchableType?: 'movie' | 'episode';
  initialTime?: number;
  prevEpisode?: EpisodeNav;
  nextEpisode?: EpisodeNav;
  subtitles?: SubtitleTrack[];
}

export function VideoPlayer({ src, poster, title, onBack, watchableId, watchableType = 'movie', initialTime = 0, prevEpisode, nextEpisode, subtitles = [] }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volTrackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoHidden, setAutoHidden] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [theater, setTheater] = useState(false);
  const [pip, setPip] = useState(false);
  const [subsOn, setSubsOn] = useState(subtitles.length > 0);
  const [activeSubLang, setActiveSubLang] = useState(subtitles[0]?.lang ?? 'en');
  const initialTimeSet = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = !autoHidden || !isPlaying || scrubbing;

  // Sync progress to backend
  useEffect(() => {
    if (!watchableId || !isPlaying) return;
    const interval = setInterval(() => {
      if (!videoRef.current) return;
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      if (time > 0) {
        syncWatchProgress({ mediaType: watchableType, mediaId: watchableId, progressSeconds: time, durationSeconds: dur });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, watchableId, watchableType]);

  // Auto-hide controls after idle
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !scrubbing) {
      idleTimerRef.current = setTimeout(() => setAutoHidden(true), 2000);
    }
  }, [isPlaying, scrubbing]);

  const resetIdleTimer = useCallback(() => {
    setAutoHidden(false);
    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    startIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [startIdleTimer]);

  // Buffer progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const update = () => {
      if (v.buffered.length > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    v.addEventListener('progress', update);
    return () => v.removeEventListener('progress', update);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); } else { v.pause(); }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    if (initialTime > 0 && !initialTimeSet.current) {
      v.currentTime = initialTime;
      initialTimeSet.current = true;
    }
  }, [initialTime]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const handleVolumeInput = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setIsMuted(true); }
    else if (v.muted) { v.muted = false; setIsMuted(false); }
  }, []);

  const changeSpeed = useCallback((rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setSettingsOpen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) { document.exitFullscreen(); } else { el.requestFullscreen(); }
  }, []);

  const toggleTheater = useCallback(() => setTheater(v => !v), []);
  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (v.requestPictureInPicture) await v.requestPictureInPicture();
    } catch {}
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnter = () => setPip(true);
    const onLeave = () => setPip(false);
    v.addEventListener('enterpictureinpicture', onEnter);
    v.addEventListener('leavepictureinpicture', onLeave);
    return () => { v.removeEventListener('enterpictureinpicture', onEnter); v.removeEventListener('leavepictureinpicture', onLeave); };
  }, []);
  // ponytail: show only selected language when subsOn
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tracks = v.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i] as TextTrack & { language?: string };
      const lang = (track as any).language || track.label?.toLowerCase() || '';
      const shouldShow = subsOn && (lang === activeSubLang || (!activeSubLang && i === 0));
      track.mode = shouldShow ? 'showing' : 'hidden';
    }
  }, [subsOn, activeSubLang, subtitles]);

  const toggleSubs = useCallback(() => {
    setSubsOn((v) => !v);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime -= 10; break;
        case 'ArrowRight': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime += 10; break;
        case 'ArrowUp': e.preventDefault(); handleVolumeInput(Math.min(1, volume + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); handleVolumeInput(Math.max(0, volume - 0.1)); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'm': e.preventDefault(); toggleMute(); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen, toggleMute, volume, handleVolumeInput]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Progress bar scrubbing
  const scrubFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const track = progressRef.current;
    if (!track || !videoRef.current) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    videoRef.current.currentTime = (videoRef.current.duration / 100) * pct;
  }, []);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setScrubbing(true);
    scrubFromEvent(e);
  }, [scrubFromEvent]);

  useEffect(() => {
    if (!scrubbing) return;
    const onMove = (e: MouseEvent) => scrubFromEvent(e);
    const onUp = () => setScrubbing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [scrubbing, scrubFromEvent]);

  // Progress hover tooltip
  const handleProgressHover = useCallback((e: React.MouseEvent) => {
    const track = progressRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setTooltipX(pct);
    setTooltipTime((duration / 100) * pct);
  }, [duration]);

  // Volume slider scrubbing
  const [volDragging, setVolDragging] = useState(false);
  const setVolFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const track = volTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleVolumeInput(pct);
  }, [handleVolumeInput]);

  const handleVolMouseDown = useCallback((e: React.MouseEvent) => {
    setVolDragging(true);
    setVolFromEvent(e);
  }, [setVolFromEvent]);

  useEffect(() => {
    if (!volDragging) return;
    const onMove = (e: MouseEvent) => setVolFromEvent(e);
    const onUp = () => setVolDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [volDragging, setVolFromEvent]);

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const volPct = isMuted ? 0 : volume * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black flex items-center justify-center overflow-hidden select-none ${theater ? 'h-[56.25vw] max-h-[70vh] max-w-6xl mx-auto aspect-video' : 'h-screen'}`}
      onMouseMove={resetIdleTimer}
    >
      <style>{`
        .vp-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.15s; flex-shrink: 0; color: white; }
        .vp-btn:hover { background: rgba(255,255,255,0.12); }
        .vp-btn svg { width: 24px; height: 24px; }
        .vp-play-main { width: 52px; height: 52px; background: #e50914; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; color: white; }
        .vp-play-main:hover { background: #f40612; }
        .vp-play-main svg { width: 28px; height: 28px; }
        .vp-ep-btn { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; transition: background 0.15s, border-color 0.15s; color: white; cursor: pointer; }
        .vp-ep-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
        .vp-ep-btn .ep-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
        .vp-ep-btn .ep-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); }
        .vp-ep-btn .ep-name { font-size: 15px; font-weight: 600; color: #fff; }
        .vp-ep-btn svg { width: 22px; height: 22px; flex-shrink: 0; color: rgba(255,255,255,0.5); }
        .vp-speed-badge { font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 7px; background: rgba(255,255,255,0.1); transition: background 0.15s; letter-spacing: 0.02em; color: white; cursor: pointer; }
        .vp-speed-badge:hover { background: rgba(255,255,255,0.2); }
        .vp-settings-popover { position: absolute; bottom: 100%; right: 0; margin-bottom: 12px; background: rgba(18,18,18,0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px 0; min-width: 210px; opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity 0.2s, transform 0.2s; z-index: 50; }
        .vp-settings-popover.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .vp-settings-popover .option { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; font-size: 15px; color: rgba(255,255,255,0.7); transition: background 0.1s; width: 100%; text-align: left; cursor: pointer; background: none; border: none; }
        .vp-settings-popover .option:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .vp-settings-popover .option .label { color: rgba(255,255,255,0.4); font-size: 13px; }
        .vp-settings-popover .option .active { color: #e50914; font-weight: 600; }
        .vp-settings-popover .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
        .vp-speed-options { display: flex; flex-wrap: wrap; gap: 5px; padding: 6px 18px 10px; }
        .vp-speed-option { padding: 5px 12px; border-radius: 7px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); transition: background 0.1s, color 0.1s; cursor: pointer; background: none; border: none; }
        .vp-speed-option:hover { background: rgba(255,255,255,0.08); color: white; }
        .vp-speed-option.active { background: rgba(229,9,20,0.2); color: #e50914; }
        .vp-vol-wrap { width: 0; overflow: hidden; transition: width 0.2s ease; display: flex; align-items: center; padding-left: 0; }
        .vp-vol-group:hover .vp-vol-wrap { width: 120px; padding-left: 8px; }
      `}</style>

      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        crossOrigin="anonymous"
      >
        {subtitles.map((s) => (
          <track key={s.url} kind="subtitles" src={s.url} srcLang={s.lang} label={s.label} default={s.lang === activeSubLang} />
        ))}
      </video>

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center gap-[18px] px-6 py-5 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500 z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={onBack || (() => router.back())}
          className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors flex-shrink-0"
        >
          <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
      </div>

      {/* Episode Nav - Previous (left) */}
      {prevEpisode && (
        <div className={`absolute bottom-[100px] left-6 z-10 flex flex-col gap-2.5 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="vp-ep-btn" onClick={prevEpisode.onClick}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            <div className="ep-info">
              <span className="ep-label">{prevEpisode.label || 'Previous'}</span>
              <span className="ep-name">{prevEpisode.name}</span>
            </div>
          </button>
        </div>
      )}

      {/* Episode Nav - Next (right) */}
      {nextEpisode && (
        <div className={`absolute bottom-[100px] right-6 z-10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="vp-ep-btn" onClick={nextEpisode.onClick}>
            <div className="ep-info">
              <span className="ep-label">{nextEpisode.label || 'Next'}</span>
              <span className="ep-name">{nextEpisode.name}</span>
            </div>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative px-6 h-[44px] flex items-end pb-[6px] cursor-pointer z-20"
          onMouseDown={handleProgressMouseDown}
          onMouseMove={handleProgressHover}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute bottom-full mb-2.5 bg-black/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums whitespace-nowrap pointer-events-none transition-opacity z-30"
              style={{ left: `${tooltipX}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(tooltipTime)}
            </div>
          )}
          <div className="w-full h-1 group-hover:h-[7px] rounded-sm bg-white/20 relative transition-all">
            {/* Buffered */}
            <div className="absolute left-0 top-0 h-full rounded-sm bg-white/25" style={{ width: `${buffered}%` }} />
            {/* Played */}
            <div className="absolute left-0 top-0 h-full rounded-sm bg-[#e50914]" style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div
              className="absolute top-1/2 w-[18px] h-[18px] rounded-full bg-[#e50914] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progress}%`, boxShadow: '0 0 8px rgba(229,9,20,0.6)' }}
            />
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-2.5 px-6 pb-5 relative z-20">
          {/* Rewind */}
          <button className="vp-btn" title="Rewind 10s" onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>

          {/* Play */}
          <button className="vp-play-main" onClick={togglePlay}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
            )}
          </button>

          {/* Forward */}
          <button className="vp-btn" title="Forward 10s" onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
          </button>

          {/* Volume */}
          <div className="flex items-center justify-center vp-vol-group">
            <button className="vp-btn" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
            <div className="vp-vol-wrap">
              <div ref={volTrackRef} className="relative w-[100px] h-4 cursor-pointer" onMouseDown={handleVolMouseDown}>
                <div className="absolute top-1/2 left-0 right-0 h-1 rounded-sm bg-[#333] -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 h-1 rounded-sm bg-white -translate-y-1/2 pointer-events-none" style={{ width: `${volPct}%` }} />
                <div
                  className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                  style={{ left: `${volPct}%`, boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                />
              </div>
            </div>
          </div>

          {/* Time */}
          <span className="text-[15px] font-medium tabular-nums text-white/85 whitespace-nowrap px-1.5">
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="mx-[3px] text-white/40">/</span>
            <span>{formatTime(duration)}</span>
          </span>

          <div className="flex-1" />

          {/* Subtitles */}
          <button className={`vp-btn ${subsOn ? 'bg-white/20' : ''}`} title="Subtitles" onClick={toggleSubs}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
          </button>

          {/* Speed */}
          <button className="vp-speed-badge">{playbackRate}x</button>

          {/* Settings */}
          <div className="relative">
            <button className="vp-btn" onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen); }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <div className={`vp-settings-popover ${settingsOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="px-[18px] py-2 text-[13px] font-semibold text-white/40">Speed</div>
              <div className="vp-speed-options">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                  <button key={r} className={`vp-speed-option ${playbackRate === r ? 'active' : ''}`} onClick={() => changeSpeed(r)}>{r}x</button>
                ))}
              </div>
              <div className="divider" />
              <button className="option" onClick={() => { toggleSubs(); setSettingsOpen(false); }}><span>Subtitles</span><span className={`label ${subsOn ? 'active' : ''}`}>{subsOn ? 'On' : 'Off'}</span></button>
              {subtitles.length > 0 && (
                <div className="vp-speed-options">
                  {subtitles.map((s) => (
                    <button key={s.lang} className={`vp-speed-option ${subsOn && activeSubLang === s.lang ? 'active' : ''}`} onClick={() => { setActiveSubLang(s.lang); setSubsOn(true); setSettingsOpen(false); }}>{s.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mini Player */}
          <button className={`vp-btn ${pip ? 'bg-white/20' : ''}`} title="Mini Player" onClick={togglePip}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1"/></svg>
          </button>

          {/* Theater Mode */}
          <button className={`vp-btn ${theater ? 'bg-white/20' : ''}`} title="Theater Mode" onClick={toggleTheater}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="17" x2="22" y2="17"/></svg>
          </button>

          {/* Fullscreen */}
          <button className="vp-btn" title="Fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>
            ) : (
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
