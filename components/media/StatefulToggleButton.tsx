'use client';

import type { ReactNode } from 'react';

// ponytail: icons live in components/ui/icons.tsx — re-exported here so old imports keep working.
export { SpinnerIcon, CheckIcon } from '@/components/ui/icons';

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
