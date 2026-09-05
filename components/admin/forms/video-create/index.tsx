'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '../ProgressBar';
import { useVideoCreate, type VideoCreateFormProps } from './use-video-create';
import { UploadFields } from './UploadFields';
import { ProviderFields } from './ProviderFields';
import { VideoPreview } from './VideoPreview';
import { CaptionsManager } from './CaptionsManager';

export type { VideoCreateFormProps };

export function VideoCreateForm(props: VideoCreateFormProps) {
  const { mediableId, mediableType, parentTitle, parentPoster, parentTmdbId, tvShowId, seasonNumber, onClose, inline = false } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const f = useVideoCreate(props);

  return (
    <div className={`flex flex-col relative ${inline ? 'bg-transparent' : 'bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-2xl motion-safe:animate-in zoom-in-95 duration-300 z-50'}`}>
      {!inline && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-[#121212]">
          <button onClick={onClose} aria-label="Close" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-semibold text-white hover:text-red-400 transition-colors duration-200 cursor-pointer focus-ring rounded-md min-w-0">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="truncate">New video</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {f.tusStatus === 'error' && <span className="text-sm text-red-400 font-medium">{f.tusMessage}</span>}
            {f.embedSaveStatus === 'error' && <span className="text-sm text-red-400 font-medium">{f.embedSaveMessage}</span>}
            {f.embedSaveStatus === 'success' && <span className="text-sm text-green-400 font-medium">{f.embedSaveMessage}</span>}
            <Button variant="brand" size="sm" onClick={f.handleSave} disabled={f.isSaveDisabled}>
              {f.isSavingEmbed ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
      <div className={`flex flex-col lg:flex-row gap-6 sm:gap-8 ${inline ? '' : 'p-4 sm:p-8'} max-w-[1600px] w-full mx-auto`}>
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <VideoPreview sourceType={f.sourceType} isProvider={f.isProvider} providerId={f.providerId} providerPreviewUrl={f.providerPreviewUrl} videoFile={f.videoFile} />
          <ProgressBar progress={f.tusProgress} status={f.tusStatus} message={f.tusMessage} onPause={f.pauseUpload} onResume={f.resumeUpload} />
          {f.sourceType === 'Upload' && (
            <CaptionsManager mediableId={mediableId} mediableType={mediableType} tvShowId={tvShowId} seasonNumber={seasonNumber} parentTmdbId={parentTmdbId} />
          )}
        </div>
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          {f.isProvider ? (
            <ProviderFields parentTitle={parentTitle} parentPoster={parentPoster} mediableType={mediableType} inline={inline} thumbInputRef={thumbInputRef} season={f.season} onSeasonChange={f.setSeason} sourceType={f.sourceType} onSourceTypeChange={f.setSourceType} providerInput={f.providerInput} onProviderInputChange={f.setProviderInput} providerId={f.providerId} providerError={f.providerError} language={f.language} onLanguageChange={f.setLanguage} save={{ status: f.tusStatus, message: f.tusMessage, embedSaveStatus: f.embedSaveStatus, embedSaveMessage: f.embedSaveMessage, label: f.isSavingEmbed ? 'Saving...' : `Save ${f.sourceType} Stream`, disabled: f.isSaveDisabled, onSave: f.handleSave }} />
          ) : (
            <UploadFields parentTitle={parentTitle} parentPoster={parentPoster} mediableType={mediableType} inline={inline} thumbInputRef={thumbInputRef} fileInputRef={fileInputRef} videoFile={f.videoFile} onVideoFileChange={f.handleVideoFileChange} sourceType={f.sourceType} onSourceTypeChange={f.setSourceType} season={f.season} onSeasonChange={f.setSeason} quality={f.quality} onQualityChange={f.setQuality} qualities={f.qualities} existingVideoQualityIds={f.existingVideoQualityIds} language={f.language} onLanguageChange={f.setLanguage} save={{ status: f.tusStatus, message: f.tusMessage, embedSaveStatus: f.embedSaveStatus, embedSaveMessage: f.embedSaveMessage, label: f.isSavingEmbed ? 'Saving...' : 'Upload Video', disabled: f.isSaveDisabled, onSave: f.handleSave }} />
          )}
        </div>
      </div>
    </div>
  );
}
