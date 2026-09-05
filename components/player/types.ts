export interface EpisodeNav {
  label: string;
  name: string;
  onClick: () => void;
}

export interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
}

export interface MediaPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onBack?: () => void;
  watchableId?: number;
  watchableType?: 'movie' | 'episode';
  initialTime?: number;
  prevEpisode?: EpisodeNav;
  nextEpisode?: EpisodeNav;
  subtitles?: SubtitleTrack[];
}

// ponytail: keep the old prop name working for existing importers.
export type VideoPlayerProps = MediaPlayerProps;
