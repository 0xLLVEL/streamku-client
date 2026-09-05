'use client';

import { createGenreAction } from '@/app/actions/admin-content';

/** Inline-create wrapper: builds the FormData the server action expects. */
export function createGenre(name: string) {
  const formData = new FormData();
  formData.append('name', name);
  return createGenreAction(formData);
}
