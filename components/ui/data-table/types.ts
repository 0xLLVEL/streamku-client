import type * as React from 'react';
import type {
  ColumnDef,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Allow per-column meta with a known shape across all tables in the app.
  // The type params must match the augmented generic's arity; they're only
  // placeholders here, hence the suppression.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
  globalFilter: string;
  onGlobalFilterChange: React.Dispatch<React.SetStateAction<string>>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  isLoading?: boolean;
  toolbarAction?: React.ReactNode;
  /** Disable column sorting UI entirely (e.g. client-merged data). */
  enableSorting?: boolean;
}
