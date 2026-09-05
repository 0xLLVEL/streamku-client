'use client';

import { useState } from 'react';
import { VideoCreateForm } from '@/components/admin/forms/VideoCreateForm';
import { PlayIcon, TrashIcon } from '@/components/ui/icons';
import { StreamRow } from './StreamRow';
import type { EmbedVideoEntry, UploadedMediaEntry } from './types';

interface StreamsTabProps {
  /** Present only when the title exists in the database. */
  titleId: number | null;
  titleName: string;
  posterPath: string | null | undefined;
  tmdbId: number | null | undefined;
  media: UploadedMediaEntry[] | null | undefined;
  videos: EmbedVideoEntry[] | null | undefined;
  onDeleteEmbedVideo: (videoId: number | string) => void;
}

/** Uploaded files plus external embeds for a movie. */
export function StreamsTab({
  titleId,
  titleName,
  posterPath,
  tmdbId,
  media,
  videos,
  onDeleteEmbedVideo,
}: StreamsTabProps) {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const mediaEntries = media ?? [];
  const embedVideos = videos ?? [];

  const existingVideoQualityIds =
    mediaEntries
      .filter((entry) => entry.type === 'video' && entry.quality?.id)
      .map((entry) => Number(entry.quality?.id)) ?? [];

  if (isAddingVideo && titleId) {
    return (
      <div className="max-w-[1600px] w-full motion-safe:animate-in fade-in duration-300">
        <VideoCreateForm
          mediableId={titleId}
          mediableType="movie"
          parentTitle={titleName || 'Unknown Title'}
          parentPoster={posterPath ?? undefined}
          parentTmdbId={tmdbId ?? undefined}
          onClose={() => setIsAddingVideo(false)}
          existingVideoQualityIds={existingVideoQualityIds}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full motion-safe:animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Streams ({mediaEntries.length + embedVideos.length})
        </h2>
        {titleId && (
          <button
            type="button"
            onClick={() => setIsAddingVideo(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 border border-white/10 cursor-pointer focus-ring"
          >
            Upload Stream
          </button>
        )}
      </div>

      {!titleId && (
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl text-center">
          <p className="text-sm text-white/50">Please save the movie first before uploading streams.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {mediaEntries.map((entry) => (
          <StreamRow key={`media-${entry.id}`} thumbnail={<PlayIcon className="w-8 h-8 text-white/20" />}>
            <p className="text-base text-white font-bold truncate">
              {entry.metadata?.label ?? entry.name}
            </p>
            <span className="text-sm text-white/60 font-medium">Uploaded Media</span>
          </StreamRow>
        ))}

        {embedVideos.map((video) => (
          <StreamRow
            key={`video-${video.id}`}
            thumbnail={
              <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                {video.site}
              </span>
            }
            action={
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteEmbedVideo(video.id);
                }}
                className="text-white/30 hover:text-red-400 hover:bg-white/5 p-2 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:text-red-400"
                title="Delete Stream"
                aria-label={`Delete stream ${video.name ?? video.key}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            }
          >
            <p className="text-base text-white font-bold truncate">{video.name}</p>
            <span className="text-xs text-white/30 mt-1">ID: {video.key}</span>
          </StreamRow>
        ))}

        {mediaEntries.length === 0 && embedVideos.length === 0 && (
          <p className="text-white/50 col-span-full py-8 text-center bg-white/5 rounded-xl border border-white/10">
            No streams available.
          </p>
        )}
      </div>
    </div>
  );
}
