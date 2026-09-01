'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { SectionCard } from '@/components/admin/ui';
import { tmdbImageUrl } from '@/lib/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { TmdbSearchResult } from './useTmdbSearch';
import { TmdbImportPanel } from './TmdbImportPanel';
import type { TitleDisplayData } from './types';

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
}

const SELECT_TRIGGER_CLASS =
  'flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

const SELECT_ITEM_CLASS =
  'hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

/** First tab of the edit form: identity, metadata and TMDB import. */
export function PrimaryFactsTab({
  data,
  fields,
  isExistingRecord,
  importSearchPlaceholder,
  importSearchAction,
  onImportTmdb,
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

      <SectionCard title="Artwork">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
            <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
              {data.poster_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tmdbImageUrl(data.poster_path, 'w342') ?? undefined}
                  alt="Poster"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity duration-200"
                />
              )}
              <button
                type="button"
                className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer focus-ring"
              >
                Replace image
              </button>
            </div>
            <button type="button" className="text-red-400 text-xs font-medium mt-3 hover:underline cursor-pointer transition-colors duration-200">
              Remove image
            </button>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-white/50 mb-2">Backdrop</label>
            <div className="aspect-video bg-white/5 rounded-xl border border-white/10 shadow-sm flex items-center justify-center relative group overflow-hidden">
              {data.backdrop_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tmdbImageUrl(data.backdrop_path, 'w1280') ?? undefined}
                  alt="Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity duration-200"
                />
              )}
              <button
                type="button"
                className="relative z-10 bg-white text-black text-xs font-bold px-4 py-2 rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer focus-ring"
              >
                Replace image
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Identity">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={fields.titleName}>{fields.titleLabel}</Label>
            <Input id={fields.titleName} name={fields.titleName} defaultValue={pickTitle(data) ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="original_title">Original title</Label>
            <Input id="original_title" name="original_title" defaultValue={data.original_title ?? ''} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={data.is_featured ?? false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-500/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 transition-colors duration-200" />
              <span className="ml-3 text-sm font-medium text-white/70">Featured</span>
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Genres">
        <GenresChips genres={data.genres} />
      </SectionCard>

      <SectionCard title="Details">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={fields.dateName}>{fields.dateLabel}</Label>
            <Input
              type="date"
              id={fields.dateName}
              name={fields.dateName}
              defaultValue={splitDate(pickDate(data, fields.dateName))}
              className="[color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={data.tagline ?? ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailer_url">Trailer URL (YouTube)</Label>
            <Input
              type="url"
              id="trailer_url"
              name="trailer_url"
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={data.trailer_url ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea id="overview" name="overview" defaultValue={data.overview ?? ''} rows={fields.overviewRows} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Metadata">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={fields.metric.name}>{fields.metric.label}</Label>
          <Input
            type="number"
            id={fields.metric.name}
            name={fields.metric.name}
            defaultValue={data[fields.metric.name] ?? (fields.metric.readOnly ? 0 : '')}
            readOnly={fields.metric.readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={data.status ?? fields.statusDefault}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
              {fields.statusOptions.map((status) => (
                <SelectItem key={status} value={status} className={SELECT_ITEM_CLASS}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="popularity">Popularity</Label>
          <Input type="number" step="0.1" id="popularity" name="popularity" defaultValue={data.popularity ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_language">Language</Label>
          <Select name="original_language" defaultValue={data.original_language ?? 'en'}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
              {LANGUAGE_OPTIONS.map((language) => (
                <SelectItem key={language.value} value={language.value} className={SELECT_ITEM_CLASS}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      </SectionCard>
    </div>
  );
}

function pickTitle(data: TitleDisplayData): string | null {
  return data.title ?? data.name ?? null;
}

function pickDate(
  data: TitleDisplayData,
  fieldName: 'release_date' | 'first_air_date',
): string | null | undefined {
  return data[fieldName];
}

function splitDate(value: string | null | undefined): string {
  return value ? value.split('T')[0] : '';
}

function GenresChips({ genres }: { genres: TitleDisplayData['genres'] }) {
  const items = genres ?? [];
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 border border-white/10 cursor-pointer focus-ring"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Genre
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((genre) => (
          <div
            key={genre.id}
            className="bg-red-600/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2"
          >
            {genre.name}
            <button type="button" aria-label={`Remove ${genre.name}`} className="hover:text-red-300 cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:text-red-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/50 text-sm">No genres assigned.</p>}
      </div>
    </div>
  );
}
