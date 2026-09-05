'use server';

import { mutateSocialEntry, deleteSocialEntry } from './social';

// ponytail: thin wrappers over social.ts — same exports, no dup logic.

export async function submitCommentAction(input: {
  mediaId: number;
  mediaType: 'movie' | 'tv_show';
  slug: string;
  body: string;
  parentId?: number;
  existingId?: number;
}) {
  return mutateSocialEntry('comments', input);
}

export async function deleteCommentAction(input: {
  id: number;
  slug: string;
}) {
  return deleteSocialEntry('comments', input);
}
