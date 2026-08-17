import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const defaultCache = process.env.NODE_ENV === 'development' ? 'no-store' : undefined;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: defaultCache,
    ...options,
    headers,
  });

  return response;
}
