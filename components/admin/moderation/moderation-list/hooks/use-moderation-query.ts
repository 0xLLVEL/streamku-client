'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client.utils';
import { MODERATION_PER_PAGE } from '../constants';
import type {
  ModerationFilter,
  ModerationPageResponse,
  ModerationTarget,
} from '../types';

export function useModerationQuery(target: ModerationTarget) {
  const [page, setPage] = React.useState(1);
  const [filter, setFilterState] = React.useState<ModerationFilter>('all');

  const setFilter = (next: ModerationFilter) => {
    setFilterState(next);
    setPage(1);
  };

  const { data, isFetching, refetch } = useQuery<ModerationPageResponse>({
    queryKey: ['admin-moderation', target, page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), per_page: String(MODERATION_PER_PAGE) });
      if (filter !== 'all') {
        params.set('is_approved', filter === 'approved' ? '1' : '0');
      }
      const res = await apiFetch(`/admin/${target}?${params}`);
      return (await res.json()) as ModerationPageResponse;
    },
  });

  return {
    page,
    setPage,
    filter,
    setFilter,
    rows: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    totalPages: Math.max(1, data?.meta?.last_page ?? 1),
    isFetching,
    refetch,
  };
}
