'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { SectionCard } from '@/components/admin/ui';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { SeasonEditData } from './types';

export function OverviewTab({ season }: { season: SeasonEditData }) {
  return (
    <div className="max-w-4xl space-y-8 motion-safe:animate-in fade-in duration-300">
      <SectionCard title="Season details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-white/50 mb-2">Poster</label>
            <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm">
              {season.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tmdbImageUrl(season.poster_path, 'w342') ?? undefined} alt="Poster" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-sm">No Poster</span>
              )}
            </div>
          </div>
          <div className="col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={season.name ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="air_date">Air Date</Label>
              <Input type="date" id="air_date" name="air_date" defaultValue={season.air_date ? season.air_date.split('T')[0] : ''} className="[color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea id="overview" name="overview" defaultValue={season.overview ?? ''} rows={5} />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
