import { fetchAdminPage } from '@/lib/api';
import { CastClient, type CastType } from './CastClient';

export default async function AdminCastPage() {
  const cast = await fetchAdminPage<CastType>('/admin/cast');
  return <CastClient initialData={cast} />;
}
