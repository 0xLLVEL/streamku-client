'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { SectionCard } from '@/components/admin/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { TitleDisplayData } from '../types';
import type { TitleFieldConfig } from './index';
import { LANGUAGE_OPTIONS, SELECT_ITEM_CLASS, SELECT_TRIGGER_CLASS } from './constants';

interface MetadataFieldsProps {
  data: TitleDisplayData;
  fields: TitleFieldConfig;
}

export function MetadataFields({ data, fields }: MetadataFieldsProps) {
  return (
    <>
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
    </>
  );
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
