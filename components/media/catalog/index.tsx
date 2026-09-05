'use client';

import { useCatalogQuery } from './hooks/use-catalog-query';
import { CatalogToolbar } from './CatalogToolbar';
import { GenreFilterPanel } from './GenreFilterPanel';
import { CatalogGrid } from './CatalogGrid';
import { CatalogPagination } from './CatalogPagination';
import type { CatalogType } from './constants';

interface MediaCatalogProps {
  type: CatalogType;
  title: string;
  description: string;
}

export function MediaCatalog({ type, title, description }: MediaCatalogProps) {
  const cq = useCatalogQuery(type);
  const showPaging = !cq.loading && !cq.error && cq.items.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 pt-24 pb-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[30px] font-semibold tracking-tight text-foreground leading-none">{title}</h1>
            <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {cq.loading ? '—' : `${cq.total.toLocaleString()} titles`}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <CatalogToolbar type={type} title={title} q={cq.q} onQ={cq.setQ} sort={cq.sort} onSort={cq.setSort}
            showFilters={cq.showFilters} onToggleFilters={() => cq.setShowFilters((v) => !v)} hasActiveFilters={cq.hasActiveFilters} />
          {cq.showFilters && (
            <GenreFilterPanel genres={cq.genres} genre={cq.genre} onGenre={cq.setGenre}
              hasActiveFilters={cq.hasActiveFilters} onClearGenre={() => cq.setGenre('')} onClearAll={cq.clearAll} />
          )}
        </div>
      </div>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 pb-10">
        <CatalogGrid loading={cq.loading} error={cq.error} title={title} items={cq.items} q={cq.q}
          hasActiveFilters={cq.hasActiveFilters} onClearAll={cq.clearAll} onRetry={cq.retry} />
        {showPaging && (
          <CatalogPagination page={cq.page} lastPage={cq.lastPage} total={cq.total}
            onPrev={() => cq.setPage((p) => Math.max(1, p - 1))} onNext={() => cq.setPage((p) => Math.min(cq.lastPage, p + 1))} />
        )}
      </div>
    </div>
  );
}
