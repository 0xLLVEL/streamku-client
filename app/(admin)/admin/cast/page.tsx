import { fetchApi } from '@/lib/api';
import { CastClient } from './CastClient';

async function getCast() {
  const res = await fetchApi('/admin/cast?per_page=20', { next: { revalidate: 0 } });
  if (!res.ok) return { data: [], last_page: 1, total: 0 };
  const json = await res.json();
  return json || { data: [], last_page: 1, total: 0 };
}

export default async function AdminCastPage() {
  const cast = await getCast();
  return <CastClient initialData={cast} />;
}
