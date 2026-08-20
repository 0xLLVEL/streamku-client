import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="w-full h-32 rounded-xl" />
        <Skeleton className="w-full h-32 rounded-xl" />
        <Skeleton className="w-full h-32 rounded-xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="w-48 h-6" />
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
