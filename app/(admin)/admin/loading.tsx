import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-4 motion-safe:animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-40 h-6" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-full h-24 rounded-xl" />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="w-full h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="w-full h-96 rounded-xl" />
      </div>

      {/* Top content table */}
      <Skeleton className="w-full h-[420px] rounded-xl" />
    </div>
  );
}
