import { DetailMeta } from '@/components/media/detail';

interface MovieMetaProps {
  releaseDate?: string | null;
  runtime?: number | null;
  voteAverage?: number | null;
  originalLanguage?: string | null;
}

export function MovieMeta({ releaseDate, runtime, voteAverage, originalLanguage }: MovieMetaProps) {
  return (
    <DetailMeta
      year={releaseDate ? new Date(releaseDate).getFullYear() : null}
      secondary={runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : null}
      voteAverage={voteAverage}
      originalLanguage={originalLanguage}
    />
  );
}
