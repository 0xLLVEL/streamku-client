import { fetchApi } from '@/lib/api.utils';
import { GenreEditForm } from '@/components/admin/forms/GenreEditForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditGenrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchApi(`/admin/genres/${id}`, { next: { revalidate: 0 } });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <div className="text-red-500">Error loading genre</div>;
  }

  const json = await res.json();
  const genre = json.data;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm mb-2">Edit Genre</h1>
          <p className="text-gray-400">Update genre details</p>
        </div>
        <Link href="/admin/genres" className="text-white/50 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold text-sm tracking-wide">
          &larr; Back to Genres
        </Link>
      </div>

      <div className="liquid-glass rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <GenreEditForm genre={genre} />
      </div>
    </div>
  );
}
