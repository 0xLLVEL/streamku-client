'use client';

import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui';
import { buttonVariants } from '@/components/ui/Button';
import { PlusIcon } from '@/components/ui/icons';
import { BulkDeleteButton } from '../BulkDeleteButton';
import type { AdminResourceListProps, AdminResourceType } from './types';

interface ResourceHeaderProps<TData> {
  title: string;
  description?: string;
  selectedRows: TData[];
  selectedIds: number[];
  resetSelection: () => void;
  createHref: string;
  createLabel: string;
  deleteType: AdminResourceType;
  renderBulkActions?: AdminResourceListProps<TData>['renderBulkActions'];
}

export function ResourceHeader<TData>({
  title,
  description,
  selectedRows,
  selectedIds,
  resetSelection,
  createHref,
  createLabel,
  deleteType,
  renderBulkActions,
}: ResourceHeaderProps<TData>) {
  return (
    <AdminPageHeader
      title={title}
      description={description}
      actions={
        <>
          {renderBulkActions
            ? renderBulkActions(selectedRows, resetSelection)
            : selectedIds.length > 0 && (
                <BulkDeleteButton
                  selectedIds={selectedIds}
                  type={deleteType}
                  onSuccess={resetSelection}
                />
              )}
          <Link
            href={createHref}
            className={buttonVariants({ variant: 'brand', size: 'sm' })}
          >
            <PlusIcon className="w-4 h-4" />
            {createLabel}
          </Link>
        </>
      }
    />
  );
}
