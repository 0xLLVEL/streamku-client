import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CARD_SHADOW =
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_8px_24px_-12px_rgba(0,0,0,0.8)]';

export function AdminCard({
  className,
  inset,
  children,
}: {
  className?: string;
  /** Slightly darker inner surface for nested content (lists inside a card). */
  inset?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10',
        inset ? 'bg-black/30' : 'bg-[#101014]',
        CARD_SHADOW,
        className,
      )}
    >
      {children}
    </div>
  );
}
