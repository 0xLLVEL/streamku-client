'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export interface AuthFormState {
  success?: boolean;
  error?: string;
}

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
} as const;

async function persistSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('token', token, TOKEN_COOKIE_OPTIONS);
}

export async function loginAction(_prevstate: AuthFormState | null, formData: FormData): Promise<AuthFormState> {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Login failed' };
    }

    await persistSession(data.data.token);
  } catch {
    return { error: 'An unexpected error occurred.' };
  }

  redirect('/');
}

export async function registerAction(
  _prevstate: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const password_confirmation = formData.get('password_confirmation');

  try {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Registration failed' };
    }

    await persistSession(data.data.token);
  } catch {
    return { error: 'An unexpected error occurred.' };
  }

  redirect('/');
}

/** Read the auth token from the httpOnly cookie. Used by client-side fetchers. */
export async function getAuthTokenAction(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

/** Delete the session cookie and return to the login page. */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export interface UpdateSettingsResult extends AuthFormState {
  user?: unknown;
}

export async function updateSettingsAction(
  _prevstate: UpdateSettingsResult | null,
  formData: FormData,
): Promise<UpdateSettingsResult> {
  const name = formData.get('name') as string;
  const language = formData.get('language') as string;
  const include_adult = formData.get('include_adult') === 'on';

  try {
    const res = await fetchApi('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({
        name,
        preferences: { language, include_adult },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Failed to update settings' };
    }

    return { success: true, user: data.data.user };
  } catch {
    return { error: 'An unexpected error occurred.' };
  }
}
