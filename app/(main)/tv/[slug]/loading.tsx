import { Skeleton } from "@/components/ui/Skeleton";

export default function DetailLoading() {
  return (
    <div className="w-full min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Backdrop Skeleton */}
      <div className="relative w-full h-[60vh] md:h-[80vh] flex items-end">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
        
        {/* Title Area */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-12 flex flex-col md:flex-row gap-8 items-end">
          {/* Poster Skeleton */}
          <Skeleton className="hidden md:block w-48 lg:w-64 aspect-[2/3] rounded-xl shadow-2xl flex-shrink-0 border border-white/10" />
          
          <div className="flex-1 space-y-4">
            <Skeleton className="w-3/4 h-10 md:h-16" />
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-32 h-5" />
            </div>
            
            <div className="flex gap-4 pt-4 pb-2">
              <Skeleton className="w-32 h-12 rounded-full" />
              <Skeleton className="w-32 h-12 rounded-full" />
            </div>
            
            <Skeleton className="w-full md:w-5/6 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs & Content Skeleton */}
      <div className="w-full px-6 md:px-12 lg:px-24 pb-24 mt-8 space-y-12">
        <div className="flex gap-6 border-b border-white/10 pb-4">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-20 h-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
