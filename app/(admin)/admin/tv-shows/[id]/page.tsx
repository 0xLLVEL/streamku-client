import { fetchApi } from '@/lib/api';
import { TvShowEditForm } from '@/components/admin/TvShowEditForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditTvShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchApi(`/admin/tv-shows/${id}`, { next: { revalidate: 0 } });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <div className="text-red-500">Error loading TV show</div>;
  }

  const json = await res.json();
  const tvShow = json.data;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
      <TvShowEditForm tvShow={tvShow} />
    </div>
  );
}
