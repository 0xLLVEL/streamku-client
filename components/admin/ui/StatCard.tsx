import type { ReactNode } from 'react';
import { AdminCard } from './AdminCard';

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
