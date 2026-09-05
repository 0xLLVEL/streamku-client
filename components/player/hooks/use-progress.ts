'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function useProgress(videoRef: RefObject<HTMLVideoElement | null>, initialTime: number) {
  const progressRef = useRef<HTMLDivElement>(null);
  const initialTimeSet = useRef(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

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
  }, [videoRef]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  }, [videoRef]);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    if (initialTime > 0 && !initialTimeSet.current) {
      v.currentTime = initialTime;
      initialTimeSet.current = true;
    }
  }, [videoRef, initialTime]);

  const scrubFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const track = progressRef.current;
    if (!track || !videoRef.current) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    videoRef.current.currentTime = (videoRef.current.duration / 100) * pct;
  }, [videoRef]);

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

  const handleProgressHover = useCallback((e: React.MouseEvent) => {
    const track = progressRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setTooltipX(pct);
    setTooltipTime((duration / 100) * pct);
  }, [duration]);

  return { progress, buffered, currentTime, duration, scrubbing, tooltipX, tooltipTime, showTooltip, setShowTooltip, progressRef, handleTimeUpdate, handleLoadedMetadata, handleProgressMouseDown, handleProgressHover };
}
