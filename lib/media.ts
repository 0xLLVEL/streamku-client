/**
 * Shared logic for picking the playable stream from a media collection.
 * Used by the watch pages, PlayAction, and SeasonEpisodeViewer.
 */

export interface StreamableVideo {
  id: number;
  is_primary?: boolean;
  metadata?: {
    content_type?: string;
    [key: string]: unknown;
  } | null;
}

export interface MediaCollection<TVideo extends StreamableVideo = StreamableVideo> {
  video?: TVideo[] | null;
}

/**
 * Pick the best video to play:
 * 1. a video whose metadata content_type matches (when `contentType` is given),
 * 2. the primary video,
 * 3. the first video.
 */
export function resolveStreamableVideo<TVideo extends StreamableVideo>(
  media: MediaCollection<TVideo> | null | undefined,
  contentType?: string,
): TVideo | null {
  const videos = media?.video ?? [];
  if (videos.length === 0) {
    return null;
  }

  const byContentType = contentType
    ? videos.find((video) => video.metadata?.content_type === contentType)
    : undefined;

  return byContentType ?? videos.find((video) => video.is_primary) ?? videos[0] ?? null;
}
