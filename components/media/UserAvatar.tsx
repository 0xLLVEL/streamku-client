import { avatarUrl } from '@/lib/config';

export function UserAvatar({
  name,
  avatar,
  userId,
  size = 'md',
  className = '',
}: {
  name?: string | null;
  avatar?: string | null;
  userId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  // Deterministic hue from the user id so each user keeps a stable color.
  const hue = (userId * 47) % 360;
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 42%), hsl(${(hue + 40) % 360} 70% 30%))`;

  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-sm'
      : size === 'md'
        ? 'w-11 h-11 text-base'
        : 'w-16 h-16 text-2xl';

  const label = (name?.trim() || `User ${userId}`).charAt(0).toUpperCase();
  const src = avatarUrl(avatar);

  if (src) {
    return (
      <img
        src={src}
        alt={name || `User ${userId}`}
        className={`${dims} ${className} shrink-0 rounded-full object-cover ring-2 ring-white/10 shadow-lg`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${dims} ${className} shrink-0 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white/10 shadow-lg select-none`}
      style={{ background: bg }}
    >
      {label}
    </div>
  );
}
