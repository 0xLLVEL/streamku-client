'use server';

import { fetchApi } from '@/lib/api';
import { cookies } from 'next/headers';

export async function loginAction(prevState: any, formData: FormData) {
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

    const cookieStore = await cookies();
    cookieStore.set('token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return { success: true };
  } catch (err) {
    return { error: 'An unexpected error occurred.' };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
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

    const cookieStore = await cookies();
    cookieStore.set('token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return { success: true };
  } catch (err) {
    return { error: 'An unexpected error occurred.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}

export async function updateSettingsAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const language = formData.get('language') as string;
  const include_adult = formData.get('include_adult') === 'on';

  try {
    const res = await fetchApi('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({
        name,
        preferences: { language, include_adult }
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Failed to update settings' };
    }

    return { success: true, user: data.data.user };
  } catch (err) {
    return { error: 'An unexpected error occurred.' };
  }
}
