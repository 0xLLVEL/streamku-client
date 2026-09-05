import { fetchApi } from '@/lib/api.utils';
import { MovieEditForm } from '@/components/admin/title-editor/MovieEditForm';
import { notFound } from 'next/navigation';

export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchApi(`/admin/movies/${id}`, { next: { revalidate: 0 } });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <div className="text-red-500">Error loading movie</div>;
  }

  const json = await res.json();
  const movie = json.data;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
      <MovieEditForm movie={movie} />
    </div>
  );
}
