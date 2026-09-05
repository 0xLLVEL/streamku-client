import { getAuthTokenAction } from '@/app/actions/auth';
import { API_BASE_URL } from '@/lib/config.utils';

export interface ApiFetchOptions extends RequestInit {
  /** When true (default) a Bearer token is required and attached. */
  requireAuth?: boolean;
}

/**
 * Client-side fetch helper for the Laravel API.
 * Resolves the auth token through a server action (httpOnly cookie).
 *
 * For server components use {@link ./api.fetchApi} instead.
 */
export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { requireAuth = true, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (requireAuth && !headers.has('Authorization')) {
    const token = await getAuthTokenAction();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      throw new Error('Authentication required');
    }
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return fetch(`${API_BASE_URL}${path}`, { ...rest, headers });
}
