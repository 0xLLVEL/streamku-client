import Image from 'next/image';
import { avatarUrl } from '@/lib/config.utils';
import { avatarGradient, initialForUser } from '@/lib/avatar.utils';

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
  const bg = avatarGradient(userId);

  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-sm'
      : size === 'md'
        ? 'w-11 h-11 text-base'
        : 'w-16 h-16 text-2xl';

  const label = initialForUser(name, userId);
  const src = avatarUrl(avatar);

  if (src) {
    return (
      <span className={`${dims} ${className} relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 shadow-lg`}>
        <Image
          src={src}
          alt={name || `User ${userId}`}
          fill
          sizes="64px"
          unoptimized
          className="object-cover"
        />
      </span>
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
