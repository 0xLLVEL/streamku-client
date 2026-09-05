'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { tmdbImageUrl } from '@/lib/config.utils';
import { PROVIDER_OPTIONS, type SourceType } from './constants';

const SELECT_CLASS = 'flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm';
const ITEM_CLASS = 'hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5';

export interface InlineSaveProps {
  status: string;
  message: string;
  embedSaveStatus: 'idle' | 'success' | 'error';
  embedSaveMessage: string;
  label: string;
  disabled: boolean;
  onSave: () => void;
}

export function TitleBlock({ parentTitle, parentPoster }: { parentTitle: string; parentPoster?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2">Title</label>
      <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="w-6 h-8 bg-white/10 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
          {parentPoster ? <Image src={tmdbImageUrl(parentPoster, 'w92') ?? ''} alt="" fill sizes="24px" className="object-cover" /> : <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M4 4h16v16H4z"></path></svg>}
        </div>
        <span className="text-white text-sm truncate">{parentTitle}</span>
      </div>
    </div>
  );
}

export function SeasonBlock({ mediableType, inline, season, onSeasonChange }: { mediableType: string; inline: boolean; season: string; onSeasonChange: (v: string) => void }) {
  if (mediableType === 'movie' || inline) return null;
  return (
    <div className="space-y-2">
      <Label htmlFor="season">Season</Label>
      <Select value={season} onValueChange={(val) => onSeasonChange(val || '')}>
        <SelectTrigger className={SELECT_CLASS}>
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
          <SelectItem value="1" className={ITEM_CLASS}>Season 1</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ThumbBlock({ thumbInputRef }: { thumbInputRef: RefObject<HTMLInputElement | null> }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2">Thumbnail</label>
      <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors" onClick={() => thumbInputRef.current?.click()}>
        <span className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Choose File</span>
        <span className="text-white/40 text-sm truncate">No file chosen</span>
        <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" />
      </div>
    </div>
  );
}

export function SourceTypeSelect({ value, onChange }: { value: SourceType; onChange: (v: SourceType) => void }) {
  return (
    <div className="space-y-2">
      <Label>Source type</Label>
      <Select value={value} onValueChange={(val) => onChange((val || 'Upload') as SourceType)}>
        <SelectTrigger className={SELECT_CLASS}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl max-h-[300px]">
          <SelectItem value="Upload" className={ITEM_CLASS}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              Direct Upload
            </span>
          </SelectItem>
          {PROVIDER_OPTIONS.map(([key, p]) => (
            <SelectItem key={key} value={key} className={ITEM_CLASS}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {p.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LanguageSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>Language</Label>
      <Select value={value} onValueChange={(val) => onChange(val || '')}>
        <SelectTrigger className={SELECT_CLASS}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
          <SelectItem value="English" className={ITEM_CLASS}>English</SelectItem>
          <SelectItem value="Indonesian" className={ITEM_CLASS}>Indonesian</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function InlineSaveButton({ status, message, embedSaveStatus, embedSaveMessage, label, disabled, onSave }: InlineSaveProps) {
  return (
    <div className="pt-4 flex flex-col gap-2 mt-auto">
      {status === 'error' && <span className="text-sm text-red-400 font-medium">{message}</span>}
      {embedSaveStatus === 'error' && <span className="text-sm text-red-400 font-medium">{embedSaveMessage}</span>}
      {embedSaveStatus === 'success' && <span className="text-sm text-green-400 font-medium">{embedSaveMessage}</span>}
      <Button variant="brand" className="w-full" onClick={onSave} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
