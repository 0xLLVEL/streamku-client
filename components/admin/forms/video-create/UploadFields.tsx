'use client';

import type { RefObject } from 'react';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { InlineSaveButton, LanguageSelect, SeasonBlock, SourceTypeSelect, ThumbBlock, TitleBlock, type InlineSaveProps } from './MetaFields';
import type { SourceType } from './constants';
import type { QualityOption } from './use-video-create';

interface UploadFieldsProps {
  parentTitle: string;
  parentPoster?: string;
  mediableType: string;
  inline: boolean;
  thumbInputRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  videoFile: File | null;
  onVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sourceType: SourceType;
  onSourceTypeChange: (v: SourceType) => void;
  season: string;
  onSeasonChange: (v: string) => void;
  quality: string;
  onQualityChange: (v: string) => void;
  qualities: QualityOption[];
  existingVideoQualityIds: number[];
  language: string;
  onLanguageChange: (v: string) => void;
  save: InlineSaveProps;
}

export function UploadFields({ parentTitle, parentPoster, mediableType, inline, thumbInputRef, fileInputRef, videoFile, onVideoFileChange, sourceType, onSourceTypeChange, season, onSeasonChange, quality, onQualityChange, qualities, existingVideoQualityIds, language, onLanguageChange, save }: UploadFieldsProps) {
  return (
    <>
      {!inline && <TitleBlock parentTitle={parentTitle} parentPoster={parentPoster} />}
      <SeasonBlock mediableType={mediableType} inline={inline} season={season} onSeasonChange={onSeasonChange} />
      {!inline && <ThumbBlock thumbInputRef={thumbInputRef} />}
      <SourceTypeSelect value={sourceType} onChange={onSourceTypeChange} />
      <div>
        <label className="block text-xs font-medium text-white/50 mb-2">Source</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full bg-white/5 border ${videoFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-white/30 transition-all`}
        >
          <span className="bg-white/10 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Choose Video</span>
          <span className={`text-sm truncate ${videoFile ? 'text-white' : 'text-white/40'}`}>{videoFile ? videoFile.name : 'No file chosen'}</span>
          <input type="file" ref={fileInputRef} className="hidden" onChange={onVideoFileChange} accept="video/mp4,video/x-m4v,video/*" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Quality</Label>
        <Select value={quality} onValueChange={(val) => onQualityChange(val || '')}>
          <SelectTrigger className="flex w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50 md:text-sm">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent className="bg-[#18181C] border-white/10 text-white rounded-xl overflow-hidden shadow-2xl">
            {qualities.filter(q => !existingVideoQualityIds.includes(Number(q.id))).map(q => (
              <SelectItem key={q.id} value={q.id.toString()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-white focus:text-white rounded-md mx-1 my-0.5">
                {q.name} ({q.label})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <LanguageSelect value={language} onChange={onLanguageChange} />
      {inline && <InlineSaveButton {...save} />}
    </>
  );
}
