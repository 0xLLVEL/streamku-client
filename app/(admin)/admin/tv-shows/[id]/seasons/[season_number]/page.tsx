import { fetchApi } from '@/lib/api';
import { SeasonEditForm } from '@/components/admin/SeasonEditForm';
import { notFound } from 'next/navigation';

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string, season_number: string }> }) {
  const resolvedParams = await params;
  const { id, season_number } = resolvedParams;

  try {
    const res = await fetchApi(`/admin/tv-shows/${id}/seasons/${season_number}`);
    
    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error('Failed to fetch season');
    }

    const json = await res.json();
    const season = json.data;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
        <SeasonEditForm tvShowId={id} season={season} />
      </div>
    );
  } catch (error) {
    return (
      <div className="h-[100vh] flex items-center justify-center text-red-500">
        Failed to load season data.
      </div>
    );
  }
}
