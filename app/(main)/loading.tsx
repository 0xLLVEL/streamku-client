import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#050505] overflow-x-hidden pt-16">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[60vh] md:h-[80vh] flex items-end">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
        
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-16 md:pb-32 space-y-4">
          <Skeleton className="w-20 h-6 md:w-24 md:h-8 rounded-full" />
          <Skeleton className="w-3/4 md:w-1/2 h-10 md:h-16" />
          <div className="flex gap-4">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
          <Skeleton className="w-full md:w-2/3 h-20 md:h-24" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="w-32 h-12 rounded-full" />
            <Skeleton className="w-32 h-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Row Skeleton */}
      <div className="relative z-20 -mt-20 md:-mt-32 space-y-12 pb-24">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pl-6 md:pl-12 lg:pl-24 pr-6">
            <Skeleton className="w-48 h-8 mb-6" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="flex-none w-[140px] md:w-[200px] lg:w-[240px] aspect-[2/3] rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
