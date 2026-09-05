'use client';

import type { TmdbSearchResult } from '../use-tmdb-search';
import { TmdbImportPanel } from '../TmdbImportPanel';
import type { TitleDisplayData } from '../types';
import { ArtworkFields } from './ArtworkFields';
import { IdentityFields } from './IdentityFields';
import { MetadataFields } from './MetadataFields';

export interface TitleFieldConfig {
  /** Form field name for the main title (`title` for movies, `name` for shows). */
  titleName: 'title' | 'name';
  titleLabel: string;
  dateName: 'release_date' | 'first_air_date';
  dateLabel: string;
  statusOptions: string[];
  statusDefault: string;
  metric: {
    name: 'runtime' | 'number_of_seasons';
    label: string;
    readOnly?: boolean;
  };
  overviewRows: number;
}

interface PrimaryFactsTabProps {
  data: TitleDisplayData;
  fields: TitleFieldConfig;
  isExistingRecord: boolean;
  importSearchPlaceholder?: string;
  importSearchAction?: (query: string) => Promise<{ success: boolean; results?: TmdbSearchResult[] }>;
  onImportTmdb?: (tmdbId: string) => void;
  onPosterSelect?: (path: string) => void;
  onBackdropSelect?: (path: string) => void;
  onClearPoster?: () => void;
  onClearBackdrop?: () => void;
}

/** First tab of the edit form: identity, metadata and TMDB import. */
export function PrimaryFactsTab({
  data,
  fields,
  isExistingRecord,
  importSearchPlaceholder,
  importSearchAction,
  onImportTmdb,
  onPosterSelect,
  onBackdropSelect,
  onClearPoster,
  onClearBackdrop,
}: PrimaryFactsTabProps) {
  return (
    <div className="max-w-4xl space-y-8 motion-safe:animate-in fade-in duration-300">
      {!isExistingRecord && importSearchAction && onImportTmdb && (
        <TmdbImportPanel
          placeholder={importSearchPlaceholder ?? 'Search...'}
          searchAction={importSearchAction}
          onImport={onImportTmdb}
        />
      )}

      <ArtworkFields
        data={data}
        onPosterSelect={onPosterSelect}
        onBackdropSelect={onBackdropSelect}
        onClearPoster={onClearPoster}
        onClearBackdrop={onClearBackdrop}
      />

      <IdentityFields data={data} fields={fields} />

      <MetadataFields data={data} fields={fields} />
    </div>
  );
}
