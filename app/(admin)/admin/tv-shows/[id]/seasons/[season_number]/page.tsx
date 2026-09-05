import { fetchApi } from '@/lib/api.utils';
import { SeasonEditForm, type SeasonEditData } from '@/components/admin/forms/SeasonEditForm';
import { notFound } from 'next/navigation';

async function getSeason(id: string, seasonNumber: string): Promise<SeasonEditData | null> {
  try {
    const res = await fetchApi(`/admin/tv-shows/${id}/seasons/${seasonNumber}`);
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function EditSeasonPage({
  params,
}: {
  params: Promise<{ id: string; season_number: string }>;
}) {
  const { id, season_number } = await params;
  const season = await getSeason(id, season_number);

  if (!season) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
      <SeasonEditForm tvShowId={id} season={season} />
    </div>
  );
}
