import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Elevated group card used to structure form sections on add/edit pages. */
export function SectionCard({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-white/10 bg-[#111114] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
      {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
      {(title || description) && <div className="mt-4" />}
      {children}
    </section>
  );
}
