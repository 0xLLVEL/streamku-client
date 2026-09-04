'use client';

import type { ReactNode } from 'react';

interface StatefulToggleButtonProps {
  onClick: () => void;
  disabled: boolean;
  className: string;
  icon: ReactNode;
  label: string;
}

/** Pill-shaped glass button used for favorite/watchlist toggles. */
export function StatefulToggleButton({
  onClick,
  disabled,
  className,
  icon,
  label,
}: StatefulToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-sm font-bold ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ponytail: resolveToggleAppearance removed — inlined in Favorite/Watchlist to avoid 7-arg abstraction
