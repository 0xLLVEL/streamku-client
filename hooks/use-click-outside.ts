'use client';

import * as React from 'react';

/**
 * Runs `onOutside` on mousedown outside the returned ref.
 * The latest callback wins without re-subscribing the listener.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  onOutside: () => void,
) {
  const ref = React.useRef<T>(null);
  const latest = React.useRef(onOutside);

  React.useEffect(() => {
    latest.current = onOutside;
  });

  React.useEffect(() => {
    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        latest.current();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return ref;
}
