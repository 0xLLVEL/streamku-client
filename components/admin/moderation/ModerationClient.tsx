'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { AdminCard, AdminPageHeader } from '@/components/admin/ui';
import { setEntryApprovedAction, deleteModerationEntryAction } from '@/app/actions/admin-moderation';

export interface ModerationRow {
  id: number;
  user_id: number;
  user_name: string | null;
  media_type: string;
  media_id: number;
  media_title: string | null;
  body: string | null;
  rating?: number;
  is_approved: boolean;
  created_at: string | null;
}

interface PageResponse {
  data?: ModerationRow[];
  meta?: { current_page?: number; last_page?: number; total?: number };
}

export function ModerationClient({
  target,
  title,
  description,
  showRating,
}: {
  target: 'reviews' | 'comments';
  title: string;
  description: string;
  showRating?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<'all' | 'approved' | 'hidden'>('all');

  const { data, isFetching, refetch } = useQuery<PageResponse>({
    queryKey: ['admin-moderation', target, page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (filter !== 'all') {
        params.set('is_approved', filter === 'approved' ? '1' : '0');
      }
      const res = await apiFetch(`/admin/${target}?${params}`);
      return (await res.json()) as PageResponse;
    },
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = Math.max(1, meta?.last_page ?? 1);

  async function mutate(action: () => Promise<{ success: boolean; error?: string }>, fallback: string) {
    const res = await action();
    if (res.success) {
      router.refresh();
      refetch();
    } else {
      alert(res.error ?? fallback);
    }
  }

  async function toggle(r: ModerationRow) {
    await mutate(
      () => setEntryApprovedAction(target, r.id, !r.is_approved),
      'Failed to update status',
    );
  }

  async function remove(r: ModerationRow) {
    await mutate(() => deleteModerationEntryAction(target, r.id), 'Failed to delete');
  }

  const label = target.slice(0, -1);

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <AdminPageHeader title={title} description={description} />

      <AdminCard className="p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {(['all', 'approved', 'hidden'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  filter === f ? 'bg-red-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All' : f === 'approved' ? 'Visible' : 'Hidden'}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/40">{(meta?.total ?? 0).toLocaleString()} total</span>
        </div>

        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-white/80">No {label}s found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">{label}</th>
                  {showRating && <th className="px-3 py-2">Rating</th>}
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-sm text-white/80 whitespace-nowrap">{r.user_name ?? `User ${r.user_id}`}</td>
                    <td className="px-3 py-3 text-sm text-white/80 max-w-[200px] truncate">{r.media_title ?? '—'}</td>
                    <td className="px-3 py-3 text-sm text-white/60 max-w-[360px]">
                      <div className="line-clamp-3">{r.body}</div>
                    </td>
                    {showRating && <td className="px-3 py-3 text-sm text-yellow-400 whitespace-nowrap">{r.rating ?? '—'}</td>}
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.is_approved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}
                      >
                        {r.is_approved ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggle(r)}
                        className="text-[13px] font-semibold text-white/60 hover:text-white mr-3 cursor-pointer"
                      >
                        {r.is_approved ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        className="text-[13px] font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>
          <span className="text-xs text-white/40">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </AdminCard>
    </div>
  );
}
