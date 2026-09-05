'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { formatTime } from './utils/formatTime';
import type { useProgress } from './hooks/use-progress';

interface ControlsBarProps {
  prog: ReturnType<typeof useProgress>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (delta: number) => void;
  volume: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onVolumeInput: (val: number) => void;
  subsOn: boolean;
  onToggleSubs: () => void;
  playbackRate: number;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  settingsMenu: ReactNode;
  pip: boolean;
  theater: boolean;
  isFullscreen: boolean;
  onTogglePip: () => void;
  onToggleTheater: () => void;
  onToggleFullscreen: () => void;
}

export function ControlsBar({ prog, isPlaying, onTogglePlay, onSeek, volume, isMuted, onToggleMute, onVolumeInput, subsOn, onToggleSubs, playbackRate, onToggleSettings, settingsMenu, pip, theater, isFullscreen, onTogglePip, onToggleTheater, onToggleFullscreen }: ControlsBarProps) {
  const { progress, buffered, currentTime, duration, tooltipX, tooltipTime, showTooltip, setShowTooltip, progressRef, handleProgressMouseDown, handleProgressHover } = prog;
  const volTrackRef = useRef<HTMLDivElement>(null);
  const [volDragging, setVolDragging] = useState(false);

  const setVolFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const track = volTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    onVolumeInput(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, [onVolumeInput]);

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

  const volPct = isMuted ? 0 : volume * 100;

  return (
    <>
      <div ref={progressRef} className="relative px-6 h-[44px] flex items-end pb-[6px] cursor-pointer z-20"
        onMouseDown={handleProgressMouseDown} onMouseMove={handleProgressHover}
        onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        {showTooltip && (
          <div className="absolute bottom-full mb-2.5 bg-black/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums whitespace-nowrap pointer-events-none transition-opacity z-30"
            style={{ left: `${tooltipX}%`, transform: 'translateX(-50%)' }}>
            {formatTime(tooltipTime)}
          </div>
        )}
        <div className="w-full h-1 group-hover:h-[7px] rounded-sm bg-white/20 relative transition-all">
          <div className="absolute left-0 top-0 h-full rounded-sm bg-white/25" style={{ width: `${buffered}%` }} />
          <div className="absolute left-0 top-0 h-full rounded-sm bg-[#e50914]" style={{ width: `${progress}%` }} />
          <div className="absolute top-1/2 w-[18px] h-[18px] rounded-full bg-[#e50914] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progress}%`, boxShadow: '0 0 8px rgba(229,9,20,0.6)' }} />
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-6 pb-5 relative z-20">
        <button className="vp-btn" title="Rewind 10s" onClick={() => onSeek(-10)}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button className="vp-play-main" onClick={onTogglePlay}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
          )}
        </button>
        <button className="vp-btn" title="Forward 10s" onClick={() => onSeek(10)}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
        </button>

        <div className="flex items-center justify-center vp-vol-group">
          <button className="vp-btn" onClick={onToggleMute}>
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
              <div className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{ left: `${volPct}%`, boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }} />
            </div>
          </div>
        </div>

        <span className="text-[15px] font-medium tabular-nums text-white/85 whitespace-nowrap px-1.5">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="mx-[3px] text-white/40">/</span>
          <span>{formatTime(duration)}</span>
        </span>

        <div className="flex-1" />

        <button className={`vp-btn ${subsOn ? 'bg-white/20' : ''}`} title="Subtitles" onClick={onToggleSubs}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
        </button>
        <button className="vp-speed-badge">{playbackRate}x</button>

        <div className="relative">
          <button className="vp-btn" onClick={(e) => { e.stopPropagation(); onToggleSettings(); }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          {settingsMenu}
        </div>

        <button className={`vp-btn ${pip ? 'bg-white/20' : ''}`} title="Mini Player" onClick={onTogglePip}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1"/></svg>
        </button>
        <button className={`vp-btn ${theater ? 'bg-white/20' : ''}`} title="Theater Mode" onClick={onToggleTheater}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="17" x2="22" y2="17"/></svg>
        </button>
        <button className="vp-btn" title="Fullscreen" onClick={onToggleFullscreen}>
          {isFullscreen ? (
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>
          ) : (
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
        </button>
      </div>
    </>
  );
}
