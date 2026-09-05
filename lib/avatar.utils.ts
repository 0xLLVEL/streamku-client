// ponytail: single source for avatar fallback — UserAvatar, Navbar, profile, settings.

/** Deterministic hue so each user keeps a stable gradient color. */
export function hueForUser(userId: number): number {
  return (userId * 47) % 360;
}

/** Gradient background style for a user id. */
export function avatarGradient(userId: number): string {
  const hue = hueForUser(userId);
  return `linear-gradient(135deg, hsl(${hue} 70% 42%), hsl(${(hue + 40) % 360} 70% 30%))`;
}

/** Fallback initial letter for a user. */
export function initialForUser(name?: string | null, userId = 0): string {
  return (name?.trim() || `User ${userId}`).charAt(0).toUpperCase();
}
