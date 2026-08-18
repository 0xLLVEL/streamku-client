'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  RowSelectionState,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>
  sorting?: SortingState
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>
  globalFilter?: string
  onGlobalFilterChange?: React.Dispatch<React.SetStateAction<string>>
  rowSelection?: RowSelectionState
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>
  isLoading?: boolean
  toolbarAction?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange: setControlledPagination,
  sorting: controlledSorting,
  onSortingChange: setControlledSorting,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange: setControlledGlobalFilter,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: setControlledRowSelection,
  isLoading,
  toolbarAction,
}: DataTableProps<TData, TValue>) {
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState('')
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})

  const isControlled = controlledPagination !== undefined

  const globalFilter = isControlled ? controlledGlobalFilter : internalGlobalFilter
  const setGlobalFilter = isControlled ? setControlledGlobalFilter! : setInternalGlobalFilter

  const sorting = isControlled ? controlledSorting : internalSorting
  const setSorting = isControlled ? setControlledSorting! : setInternalSorting

  const pagination = isControlled ? controlledPagination : internalPagination
  const setPagination = isControlled ? setControlledPagination! : setInternalPagination

  const rowSelection = isControlled ? controlledRowSelection : internalRowSelection
  const setRowSelection = isControlled ? setControlledRowSelection! : setInternalRowSelection

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      globalFilter,
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection: true,
    manualPagination: isControlled,
    manualSorting: isControlled,
    manualFiltering: isControlled,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 text-white w-full transition-colors placeholder:text-gray-600"
          />
        </div>
        
        {toolbarAction}
      </div>

      {/* Table Area */}
      <div className="rounded-xl border border-white/5 bg-[#0A0A0A] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={(header.column.columnDef.meta as any)?.className}>
                      {header.isPlaceholder
                        ? null
                        : (
                            <div
                              className={header.column.getCanSort() ? "flex items-center gap-2 cursor-pointer select-none group/sort hover:text-white transition-colors" : "flex items-center gap-2"}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>,
                                desc: <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>,
                              }[header.column.getIsSorted() as string] ?? (
                                header.column.getCanSort() ? <svg className="w-3.5 h-3.5 opacity-0 group-hover/sort:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg> : null
                              )}
                            </div>
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-white/50">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() === -1 ? '?' : table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white text-xs font-medium"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white text-xs font-medium"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  )
}
