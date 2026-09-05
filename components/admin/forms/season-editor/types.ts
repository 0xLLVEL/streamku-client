export interface SeasonEditEpisode {
  id: number;
  episode_number: number;
  name?: string | null;
  overview?: string | null;
  still_path?: string | null;
  air_date?: string | null;
  runtime?: number | null;
}

export interface SeasonEditData {
  id: number;
  season_number: number;
  name?: string | null;
  overview?: string | null;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: SeasonEditEpisode[];
}

export interface SeasonEditFormProps {
  tvShowId: number | string;
  season: SeasonEditData;
}

export interface SeasonFormMessage {
  text: string;
  type: 'success' | 'error';
}
