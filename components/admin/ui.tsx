import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared admin panel primitives. Server-compatible (no hooks, no function
 * props) so they can render inside server components; pass interactive
 * elements via `children` / `actions` slots instead.
 *
 * Surface tokens:
 * - page background: `#060607`
 * - card:            `#101014` + `border-white/10`
 * - inset:           `black/30`
 */

const CARD_SHADOW = 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_8px_24px_-12px_rgba(0,0,0,0.8)]';

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

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-white/50">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption?: string;
  /** Decorative icon rendered in a red-tinted chip on the right. */
  icon?: ReactNode;
}) {
  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {label}
          </h3>
          <p className="mt-2.5 text-[28px] font-medium leading-none text-white">{value}</p>
          {caption && (
            <p className="mt-1.5 text-xs text-white/40 truncate">{caption}</p>
          )}
        </div>
        {icon && (
          <div
            aria-hidden
            className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5"
          >
            {icon}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-white/80">{title}</p>
      {description && <p className="max-w-sm text-xs text-white/50">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

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
