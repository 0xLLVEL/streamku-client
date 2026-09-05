'use server';

import { mutateSocialEntry, deleteSocialEntry } from './social';

// ponytail: thin wrappers over social.ts — same exports, no dup logic.

export async function submitReviewAction(input: {
  mediaId: number;
  mediaType: 'movie' | 'tv_show';
  slug: string;
  rating: number;
  body: string;
  existingId?: number;
}) {
  return mutateSocialEntry('reviews', input);
}

export async function deleteReviewAction(input: {
  id: number;
  slug: string;
}) {
  return deleteSocialEntry('reviews', input);
}
