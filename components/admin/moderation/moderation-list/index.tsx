'use client';

import { AdminCard, AdminPageHeader } from '@/components/admin/ui';
import { ModerationToolbar } from './ModerationToolbar';
import { ModerationTable } from './ModerationTable';
import { ModerationPagination } from './ModerationPagination';
import { useModerationQuery } from './hooks/use-moderation-query';
import { useModerationMutations } from './hooks/use-moderation-mutations';
import type { ModerationClientProps } from './types';

export type {
  ModerationClientProps,
  ModerationFilter,
  ModerationRow,
  ModerationTarget,
} from './types';

export function ModerationClient({ target, title, description, showRating }: ModerationClientProps) {
  const { page, setPage, filter, setFilter, rows, total, totalPages, isFetching, refetch } =
    useModerationQuery(target);
  const { toggle, remove } = useModerationMutations(target, refetch);
  const label = target.slice(0, -1);

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <AdminPageHeader title={title} description={description} />

      <AdminCard className="p-6">
        <ModerationToolbar filter={filter} onFilterChange={setFilter} total={total} />
        <ModerationTable
          label={label}
          rows={rows}
          showRating={showRating}
          onToggle={toggle}
          onRemove={remove}
        />
        <ModerationPagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </AdminCard>
    </div>
  );
}
