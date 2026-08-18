import { getAuthTokenAction } from '@/app/actions/upload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchApi(endpoint: string, options: FetchApiOptions = {}) {
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

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  return response;
}
