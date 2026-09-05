'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import type { SettingsForm } from './use-settings-form';

type Props = Pick<SettingsForm, 'username' | 'setUsername' | 'nickname' | 'setNickname' | 'email' | 'setEmail' | 'avatarPreview' | 'avatarFile' | 'setAvatarFile' | 'clearAvatar'> & {
  ref?: RefObject<HTMLInputElement | null>;
};

export function ProfileSection({ ref: fileRef, ...p }: Props) {
  const display = p.nickname || p.username || 'U';
  return (
    <section id="section-profile" aria-labelledby="profile-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-border">
        <h2 id="profile-heading" className="text-base font-semibold text-foreground tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Visible to other members in reviews and comments.</p>
      </div>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 sm:w-[160px] shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xl shrink-0">
              {p.avatarPreview ? <Image src={p.avatarPreview} alt={`${p.nickname || p.username} avatar preview`} fill sizes="96px" unoptimized className="object-cover" /> : display.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-2 items-start sm:items-center">
              <input ref={fileRef} type="file" name="avatar" accept="image/*" className="hidden" onChange={(e) => p.setAvatarFile(e.target.files?.[0] ?? null)} aria-label="Upload avatar image" />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef?.current?.click()} className="h-8 rounded-full px-4 text-xs">{p.avatarFile ? 'Change' : 'Upload'}</Button>
              {p.avatarPreview && <button type="button" onClick={p.clearAvatar} className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-ring rounded">Remove</button>}
              <span className="hidden sm:block text-[11px] text-muted-foreground">JPG or PNG, max 2MB</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                {p.avatarPreview ? <Image src={p.avatarPreview} alt="" fill sizes="36px" unoptimized className="object-cover" aria-hidden /> : display.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.nickname || p.username || 'Your display name'}</p>
                <p className="text-xs text-muted-foreground truncate">{p.username ? `${p.username} • preview` : 'Preview how others see you'}</p>
              </div>
              <span className="ml-auto hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <p className="text-xs text-muted-foreground px-1">Avatar is cropped to square. Keep it recognizable at small sizes.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="settings-username">Username</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>@</span>
                <Input id="settings-username" name="username" value={p.username} onChange={(e) => p.setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="streamku_fan" maxLength={30} autoComplete="username" className="pl-8" aria-describedby="username-help" />
              </div>
              <p id="username-help" className="text-xs text-muted-foreground">3–30 characters: letters, numbers, underscore.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-nickname">Display name</Label>
              <Input id="settings-nickname" name="nickname" value={p.nickname} onChange={(e) => p.setNickname(e.target.value)} placeholder="Budi" maxLength={50} autoComplete="nickname" aria-describedby="nickname-help" />
              <p id="nickname-help" className="text-xs text-muted-foreground">Max 50 characters. Public. No @ needed.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email address</Label>
            <Input id="settings-email" name="email" type="email" value={p.email} onChange={(e) => p.setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" aria-describedby="email-help" />
            <p id="email-help" className="text-xs text-muted-foreground">Used for sign-in and notifications. Must be unique.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
