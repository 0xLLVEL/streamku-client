import { DetailMeta } from '@/components/media/detail';

interface TvMetaProps {
  firstAirDate?: string | null;
  numberOfSeasons?: number | null;
  voteAverage?: number | null;
  originalLanguage?: string | null;
}

export function TvMeta({ firstAirDate, numberOfSeasons, voteAverage, originalLanguage }: TvMetaProps) {
  return (
    <DetailMeta
      year={firstAirDate ? new Date(firstAirDate).getFullYear() : null}
      secondary={(numberOfSeasons ?? 0) > 0 ? `${numberOfSeasons} Seasons` : null}
      voteAverage={voteAverage}
      originalLanguage={originalLanguage}
    />
  );
}
