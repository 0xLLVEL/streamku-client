import { fetchApi } from '@/lib/api';
import { EpisodeEditForm } from '@/components/admin/EpisodeEditForm';
import { notFound } from 'next/navigation';

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string, season_number: string, episode_number: string }> }) {
  const resolvedParams = await params;
  const { id, season_number, episode_number } = resolvedParams;

  try {
    const res = await fetchApi(`/admin/tv-shows/${id}/seasons/${season_number}/episodes/${episode_number}`);
    
    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error('Failed to fetch episode');
    }

    const json = await res.json();
    const episode = json.data;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
        <EpisodeEditForm tvShowId={id} seasonNumber={season_number} episode={episode} />
      </div>
    );
  } catch (error) {
    return (
      <div className="h-[100vh] flex items-center justify-center text-red-500">
        Failed to load episode data.
      </div>
    );
  }
}
