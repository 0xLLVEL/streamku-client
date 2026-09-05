'use client';

import type { RefObject } from 'react';
import { InlineSaveButton, LanguageSelect, SeasonBlock, SourceTypeSelect, ThumbBlock, TitleBlock, type InlineSaveProps } from './MetaFields';
import type { SourceType } from './constants';

interface ProviderFieldsProps {
  parentTitle: string;
  parentPoster?: string;
  mediableType: string;
  inline: boolean;
  thumbInputRef: RefObject<HTMLInputElement | null>;
  season: string;
  onSeasonChange: (v: string) => void;
  sourceType: SourceType;
  onSourceTypeChange: (v: SourceType) => void;
  providerInput: string;
  onProviderInputChange: (v: string) => void;
  providerId: string | null;
  providerError: string;
  language: string;
  onLanguageChange: (v: string) => void;
  save: InlineSaveProps;
}

export function ProviderFields({ parentTitle, parentPoster, mediableType, inline, thumbInputRef, season, onSeasonChange, sourceType, onSourceTypeChange, providerInput, onProviderInputChange, providerId, providerError, language, onLanguageChange, save }: ProviderFieldsProps) {
  return (
    <>
      {!inline && <TitleBlock parentTitle={parentTitle} parentPoster={parentPoster} />}
      <SeasonBlock mediableType={mediableType} inline={inline} season={season} onSeasonChange={onSeasonChange} />
      {!inline && <ThumbBlock thumbInputRef={thumbInputRef} />}
      <SourceTypeSelect value={sourceType} onChange={onSourceTypeChange} />
      <div>
        <label className="block text-xs font-medium text-white/50 mb-2">Source</label>
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-xs text-blue-300">Paste a {sourceType} embed URL or TMDB ID</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={providerInput}
              onChange={(e) => onProviderInputChange(e.target.value)}
              placeholder={sourceType === 'VidLink' ? 'https://vidlink.pro/movie/27205  or  27205' : `https://.../embed/...  or  TMDB ID`}
              className={`w-full bg-black/40 border ${providerError ? 'border-red-500/50' : providerId ? 'border-green-500/40' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/60 transition-colors duration-200 placeholder:text-white/30`}
            />
            {providerId && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
          </div>
          {providerError && <p className="text-xs text-red-400">{providerError}</p>}
          {providerId && (
            <p className="text-xs text-green-400">
              Video ID: <span className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded">{providerId}</span>
            </p>
          )}
          {save.embedSaveStatus === 'success' && <p className="text-xs text-green-400 font-medium">{save.embedSaveMessage}</p>}
          {save.embedSaveStatus === 'error' && <p className="text-xs text-red-400 font-medium">{save.embedSaveMessage}</p>}
        </div>
      </div>
      <LanguageSelect value={language} onChange={onLanguageChange} />
      {inline && <InlineSaveButton {...save} />}
    </>
  );
}
