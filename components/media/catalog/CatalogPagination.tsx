'use client';

import { Button } from '@/components/ui/Button';

interface CatalogPaginationProps {
  page: number;
  lastPage: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function CatalogPagination({ page, lastPage, total, onPrev, onNext }: CatalogPaginationProps) {
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between border-t border-border pt-6">
      <p className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {lastPage} <span className="hidden sm:inline">• {total.toLocaleString()} titles</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPrev} aria-label="Previous page">Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={onNext} aria-label="Next page">Next</Button>
      </div>
    </nav>
  );
}
