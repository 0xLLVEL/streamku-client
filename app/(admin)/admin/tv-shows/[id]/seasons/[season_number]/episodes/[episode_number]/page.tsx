import { fetchApi } from '@/lib/api';
import { EpisodeEditForm, type EpisodeEditData } from '@/components/admin/EpisodeEditForm';
import { notFound } from 'next/navigation';

async function getEpisode(
  id: string,
  seasonNumber: string,
  episodeNumber: string,
): Promise<EpisodeEditData | null> {
  try {
    const res = await fetchApi(
      `/admin/tv-shows/${id}/seasons/${seasonNumber}/episodes/${episodeNumber}`,
    );
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string; season_number: string; episode_number: string }>;
}) {
  const { id, season_number, episode_number } = await params;
  const episode = await getEpisode(id, season_number, episode_number);

  if (!episode) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
      <EpisodeEditForm tvShowId={id} seasonNumber={season_number} episode={episode} />
    </div>
  );
}
