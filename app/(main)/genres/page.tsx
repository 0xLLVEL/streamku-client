import { fetchApi } from '@/lib/api';
import Link from 'next/link';

async function getGenres() {
  const res = await fetchApi('/genres', { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function GenresPage() {
  const genres = await getGenres();

  return (
    <div className="pt-32 pb-20 px-8 md:px-16 lg:px-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Genres</h1>
          <p className="text-white/50 mt-2 font-medium">Find exactly what you're in the mood for.</p>
        </div>
      </div>

      {genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {genres.map((genre: any) => (
            <Link 
              key={genre.id} 
              href={`/genres/${genre.slug}`}
              className="liquid-glass group relative overflow-hidden rounded-2xl aspect-[3/2] flex items-center justify-center transition-all duration-500 hover:scale-[1.05] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
            >
              {/* Dynamic gradient background based on genre name length/chars for slight variety */}
              <div 
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, hsl(${(genre.name.length * 20) % 360}, 70%, 50%), hsl(${((genre.name.length * 20) + 60) % 360}, 80%, 40%))`
                }}
              />
              <span className="relative z-10 text-xl font-bold text-white tracking-wide drop-shadow-lg">
                {genre.name}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center liquid-glass rounded-3xl">
          <p className="text-white/50 text-lg">No genres found.</p>
        </div>
      )}
    </div>
  );
}
