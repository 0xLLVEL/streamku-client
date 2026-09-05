'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SectionCard } from '@/components/admin/ui';
import type { TitleDisplayData } from '../types';
import type { TitleFieldConfig } from './index';

interface IdentityFieldsProps {
  data: TitleDisplayData;
  fields: TitleFieldConfig;
}

export function IdentityFields({ data, fields }: IdentityFieldsProps) {
  return (
    <>
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
    </>
  );
}

function pickTitle(data: TitleDisplayData): string | null {
  return data.title ?? data.name ?? null;
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
