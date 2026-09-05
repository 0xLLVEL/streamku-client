'use client';

import { useEffect, useState } from 'react';
import { AUTOPLAY_MS } from '../constants';

export function useAutoplay(length: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [length, isPaused]);

  return { currentIndex, setCurrentIndex, isPaused, setIsPaused };
}
