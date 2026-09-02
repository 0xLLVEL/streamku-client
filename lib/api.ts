import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/config';

/**
 * Server-side fetch helper for the Laravel API.
 * Attaches the auth token stored in the `token` cookie when present.
 *
 * For client components use {@link ./apiClient.apiFetch} instead.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // In development, avoid caching unless the caller explicitly opted into
  // Next.js caching via the `next` option.
  const devCache: RequestInit = {};
  if (process.env.NODE_ENV === 'development' && !options.next && !options.cache) {
    devCache.cache = 'no-store';
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    ...devCache,
    headers,
  });
}

/** Shape returned by the Laravel paginator (`->toArray()`). */
export interface PaginatedPayload<TData> {
  data: TData[];
  last_page?: number;
  total?: number;
}

const EMPTY_PAGE: PaginatedPayload<never> = { data: [], last_page: 1, total: 0 };

/**
 * Fetch the first page of an admin resource list for server-rendered tables.
 * Returns a safe empty payload when the API call fails.
 */
export async function fetchAdminPage<TData>(
  endpoint: string,
  perPage = 20,
): Promise<PaginatedPayload<TData>> {
  const res = await fetchApi(`${endpoint}?per_page=${perPage}`, { next: { revalidate: 0 } });
  if (!res.ok) {
    return EMPTY_PAGE;
  }
  const json = await res.json();
  return json ?? EMPTY_PAGE;
}
