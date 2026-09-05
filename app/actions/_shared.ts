// ponytail: plain helper module (no 'use server') — shared by server actions.

/** Fallback message for unexpected action failures. */
export const UNEXPECTED_ERROR = 'An unexpected error occurred.';

/** Pull the API's error message, falling back to a contextual default. */
export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}
