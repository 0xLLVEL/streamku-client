import { fetchAdminPage } from '@/lib/api';
import { StatCard } from '@/components/admin/ui';
import { CastClient, type CastType } from './CastClient';

export default async function AdminCastPage() {
  const cast = await fetchAdminPage<CastType>('/admin/cast');
  const total = cast.total ?? cast.data?.length ?? 0;

  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Cast"
          value={total.toLocaleString()}
          caption="people credited on titles"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>
      <CastClient initialData={cast} />
    </div>
  );
}
