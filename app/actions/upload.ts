'use server';

import { cookies } from 'next/headers';

export async function getAuthTokenAction() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}
