'use client';

import * as React from 'react';
import type { RowSelectionState } from '@tanstack/react-table';

export function useRowSelection<TData extends { id: number }>(rows: TData[]) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const resetSelection = () => setRowSelection({});

  const selectedRows = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([index]) => rows[Number(index)])
    .filter((row): row is TData => Boolean(row));
  const selectedIds = selectedRows.map((row) => row.id);

  return { rowSelection, setRowSelection, resetSelection, selectedRows, selectedIds };
}
