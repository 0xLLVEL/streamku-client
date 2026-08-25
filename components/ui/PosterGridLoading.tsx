import { Skeleton } from '@/components/ui/Skeleton';

/** Shared placeholder for poster-grid pages (movies, tv shows, genres). */
export function PosterGridLoading() {
  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <Skeleton className="w-48 h-10 mb-2" />
          <Skeleton className="w-64 h-5" />
        </div>
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 15 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="w-full aspect-[2/3] rounded-xl" />
            <Skeleton className="w-3/4 h-4 mt-2" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
