/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { syncWatchProgress } from '@/lib/watch-history.utils';
import { PLAYER_STYLES, SEEK_SECONDS, SYNC_INTERVAL_MS } from './constants';
import type { MediaPlayerProps } from './types';
import { useProgress } from './hooks/use-progress';
import { useIdleHide } from './hooks/use-idle-hide';
import { useFullscreen } from './hooks/use-fullscreen';
import { ControlsBar } from './ControlsBar';
import { SettingsMenu } from './SettingsMenu';

export function MediaPlayer({ src, poster, title, onBack, watchableId, watchableType = 'movie', initialTime = 0, prevEpisode, nextEpisode, subtitles = [] }: MediaPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theater, setTheater] = useState(false);
  const [pip, setPip] = useState(false);
  const [subsOn, setSubsOn] = useState(subtitles.length > 0);
  const [activeSubLang, setActiveSubLang] = useState(subtitles[0]?.lang ?? 'en');

  const prog = useProgress(videoRef, initialTime);
  const { autoHidden, resetIdleTimer } = useIdleHide(isPlaying, prog.scrubbing);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const showControls = !autoHidden || !isPlaying || prog.scrubbing;
  useEffect(() => {
    if (!watchableId || !isPlaying) return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (v && v.currentTime > 0) syncWatchProgress({ mediaType: watchableType, mediaId: watchableId, progressSeconds: v.currentTime, durationSeconds: v.duration });
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying, watchableId, watchableType]);

  const togglePlay = useCallback(() => { const v = videoRef.current; if (!v) return; if (v.paused) v.play(); else v.pause(); }, []);
  const toggleMute = useCallback(() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setIsMuted(v.muted); }, []);
  const seek = useCallback((delta: number) => { if (videoRef.current) videoRef.current.currentTime += delta; }, []);
  const handleVolumeInput = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setIsMuted(true); }
    else if (v.muted) { v.muted = false; setIsMuted(false); }
  }, []);
  const changeSpeed = useCallback((rate: number) => { if (videoRef.current) videoRef.current.playbackRate = rate; setPlaybackRate(rate); setSettingsOpen(false); }, []);
  const toggleTheater = useCallback(() => setTheater((v) => !v), []);
  const toggleSubs = useCallback(() => setSubsOn((v) => !v), []);
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
      track.mode = subsOn && (lang === activeSubLang || (!activeSubLang && i === 0)) ? 'showing' : 'hidden';
    }
  }, [subsOn, activeSubLang, subtitles]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seek(-SEEK_SECONDS); break;
        case 'ArrowRight': e.preventDefault(); seek(SEEK_SECONDS); break;
        case 'ArrowUp': e.preventDefault(); handleVolumeInput(Math.min(1, volume + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); handleVolumeInput(Math.max(0, volume - 0.1)); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'm': e.preventDefault(); toggleMute(); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen, toggleMute, volume, handleVolumeInput, seek]);

  return (
    <div ref={containerRef} onMouseMove={resetIdleTimer} className={`relative w-full bg-black flex items-center justify-center overflow-hidden select-none ${theater ? 'h-[56.25vw] max-h-[70vh] max-w-6xl mx-auto aspect-video' : 'h-screen'}`}>
      <style>{PLAYER_STYLES}</style>
      <video ref={videoRef} src={src} poster={poster} className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={prog.handleTimeUpdate} onLoadedMetadata={prog.handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
        onClick={togglePlay} onDoubleClick={toggleFullscreen} crossOrigin="anonymous">
        {subtitles.map((s) => (
          <track key={s.url} kind="subtitles" src={s.url} srcLang={s.lang} label={s.label} default={s.lang === activeSubLang} />
        ))}
      </video>

      <div className={`absolute top-0 left-0 right-0 flex items-center gap-[18px] px-6 py-5 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500 z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={onBack || (() => router.back())} className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors flex-shrink-0">
          <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
      </div>

      {prevEpisode && (
        <div className={`absolute bottom-[100px] left-6 z-10 flex flex-col gap-2.5 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="vp-ep-btn" onClick={prevEpisode.onClick}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            <div className="ep-info"><span className="ep-label">{prevEpisode.label || 'Previous'}</span><span className="ep-name">{prevEpisode.name}</span></div>
          </button>
        </div>
      )}
      {nextEpisode && (
        <div className={`absolute bottom-[100px] right-6 z-10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="vp-ep-btn" onClick={nextEpisode.onClick}>
            <div className="ep-info"><span className="ep-label">{nextEpisode.label || 'Next'}</span><span className="ep-name">{nextEpisode.name}</span></div>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
        <ControlsBar prog={prog} isPlaying={isPlaying} onTogglePlay={togglePlay} onSeek={seek} volume={volume} isMuted={isMuted}
          onToggleMute={toggleMute} onVolumeInput={handleVolumeInput} subsOn={subsOn} onToggleSubs={toggleSubs} playbackRate={playbackRate}
          settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((v) => !v)} pip={pip} theater={theater} isFullscreen={isFullscreen}
          onTogglePip={togglePip} onToggleTheater={toggleTheater} onToggleFullscreen={toggleFullscreen}
          settingsMenu={<SettingsMenu open={settingsOpen} playbackRate={playbackRate} subsOn={subsOn} subtitles={subtitles} activeSubLang={activeSubLang} onSpeed={changeSpeed} onToggleSubs={() => { toggleSubs(); setSettingsOpen(false); }} onPickLang={(lang) => { setActiveSubLang(lang); setSubsOn(true); setSettingsOpen(false); }} />} />
      </div>
    </div>
  );
}
