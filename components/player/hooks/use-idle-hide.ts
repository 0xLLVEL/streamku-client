'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IDLE_HIDE_MS } from '../constants';

export function useIdleHide(isPlaying: boolean, scrubbing: boolean) {
  const [autoHidden, setAutoHidden] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !scrubbing) {
      idleTimerRef.current = setTimeout(() => setAutoHidden(true), IDLE_HIDE_MS);
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

  return { autoHidden, resetIdleTimer };
}
