/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth, type User } from '@/providers/AuthProvider';
import { updateSettingsAction } from '@/app/actions/auth';
import { useActionState, useEffect, useState, useRef } from 'react';
import { avatarUrl } from '@/lib/config';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

type SectionId = 'profile' | 'account' | 'preferences';

const NAV_ITEMS: { id: SectionId; label: string; description: string }[] = [
  { id: 'profile', label: 'Profile', description: 'Avatar & display name' },
  { id: 'account', label: 'Account', description: 'Email & password' },
  { id: 'preferences', label: 'Preferences', description: 'Language & content' },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [username, setUsername] = useState((user as unknown as { username?: string })?.username ?? user?.name ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'en');
  const [includeAdult, setIncludeAdult] = useState(user?.preferences?.include_adult ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl(user?.avatar) ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success && state.user) setUser(state.user as User);
  }, [state, setUser]);

  useEffect(() => {
    if (user) {
      setUsername((user as unknown as { username?: string })?.username ?? user.name ?? '');
      setNickname(user.nickname ?? '');
      setEmail(user.email ?? '');
      setLanguage(user.preferences?.language ?? 'en');
      setIncludeAdult(!!user.preferences?.include_adult);
    }
  }, [user, (user as unknown as { username?: string })?.username, user?.nickname, user?.email, user?.preferences?.language, user?.preferences?.include_adult]);

  useEffect(() => {
    if (state?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [state?.success]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAvatarPreview(avatarUrl(user?.avatar) ?? null);
    }
  }, [avatarFile, user?.avatar]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center mb-4" aria-hidden>
          <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Sign in required</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">You need to be signed in to manage your account settings.</p>
        <a href="/login" className="mt-6 inline-flex items-center justify-center h-10 px-6 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors focus-ring">Go to login</a>
      </div>
    );
  }

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-foreground leading-none">Settings</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">Manage your profile, account security, and viewing preferences. Changes apply across reviews, comments, and recommendations.</p>
        </div>

        {/* Feedback */}
        {state?.error && (
          <div role="alert" className="mb-6 flex gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span className="min-w-0">{state.error}</span>
          </div>
        )}
        {state?.success && (
          <div role="status" className="mb-6 flex gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-200">
            <svg className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Settings saved. Your profile is updated everywhere.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 items-start">
          {/* Sidebar / Tabs */}
          <nav aria-label="Settings sections" className="lg:sticky lg:top-20">
            {/* Mobile: horizontal tabs */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none" role="tablist">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={activeSection === item.id}
                  aria-controls={`section-${item.id}`}
                  onClick={() => scrollTo(item.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors focus-ring ${activeSection === item.id ? 'bg-foreground text-background border-foreground' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {/* Desktop: vertical nav */}
            <div className="hidden lg:block rounded-2xl border border-border bg-card p-2">
              {NAV_ITEMS.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full text-left rounded-xl px-3 py-3 flex items-start gap-3 transition-colors focus-ring ${active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <span className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${active ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'}`} aria-hidden>
                      {item.label.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold leading-none ${active ? 'text-background' : 'text-foreground'}`}>{item.label}</span>
                      <span className={`block text-xs mt-1 leading-none ${active ? 'text-background/70' : 'text-muted-foreground'}`}>{item.description}</span>
                    </span>
                  </button>
                );
              })}
              <div className="mt-3 pt-3 border-t border-border px-3 pb-2">
                <p className="text-xs text-muted-foreground leading-relaxed">Signed in as <span className="text-foreground font-medium">{user.email}</span></p>
              </div>
            </div>
          </nav>

          {/* Content */}
          <form action={formAction} className="space-y-6" aria-labelledby="settings-heading">
            <h2 id="settings-heading" className="sr-only">Account settings</h2>

            {/* Profile */}
            <section id="section-profile" aria-labelledby="profile-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-border">
                <h2 id="profile-heading" className="text-base font-semibold text-foreground tracking-tight">Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Visible to other members in reviews and comments.</p>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Avatar row */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 sm:w-[160px] shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xl shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {avatarPreview ? <img src={avatarPreview} alt={`${nickname || username} avatar preview`} className="w-full h-full object-cover" /> : (nickname || username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-2 items-start sm:items-center">
                      <input ref={fileRef} type="file" name="avatar" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} aria-label="Upload avatar image" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="h-8 rounded-full px-4 text-xs">
                        {avatarFile ? 'Change' : 'Upload'}
                      </Button>
                      {avatarPreview && (
                        <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-ring rounded">Remove</button>
                      )}
                      <span className="hidden sm:block text-[11px] text-muted-foreground">JPG or PNG, max 2MB</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                        {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" aria-hidden /> : (nickname || username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{nickname || username || 'Your display name'}</p>
                        <p className="text-xs text-muted-foreground truncate">{username ? `${username} • preview` : 'Preview how others see you'}</p>
                      </div>
                      <span className="ml-auto hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Preview</span>
                    </div>
                    <p className="text-xs text-muted-foreground px-1">Avatar is cropped to square. Keep it recognizable at small sizes.</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="settings-username">Username</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>@</span>
                        <Input id="settings-username" name="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="streamku_fan" maxLength={30} autoComplete="username" className="pl-8" aria-describedby="username-help" />
                      </div>
                      <p id="username-help" className="text-xs text-muted-foreground">3–30 characters: letters, numbers, underscore.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="settings-nickname">Display name</Label>
                      <Input id="settings-nickname" name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Budi" maxLength={50} autoComplete="nickname" aria-describedby="nickname-help" />
                      <p id="nickname-help" className="text-xs text-muted-foreground">Max 50 characters. Public. No @ needed.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email address</Label>
                    <Input id="settings-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" aria-describedby="email-help" />
                    <p id="email-help" className="text-xs text-muted-foreground">Used for sign-in and notifications. Must be unique.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account */}
            <section id="section-account" aria-labelledby="account-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-border">
                <h2 id="account-heading" className="text-base font-semibold text-foreground tracking-tight">Account</h2>
                <p className="text-sm text-muted-foreground mt-1">Change your password. Leave blank to keep the current one.</p>
              </div>
              <div className="p-6 md:p-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="settings-current-password">Current password</Label>
                  <div className="relative">
                    <Input id="settings-current-password" name="current_password" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to set a new password" autoComplete="current-password" className="pr-10" />
                    <button type="button" onClick={() => setShowPasswords((v) => !v)} aria-label={showPasswords ? 'Hide password' : 'Show password'} aria-pressed={showPasswords} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring">
                      {showPasswords ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L14.12 14.12m-4.242-4.242L19.5 5.25M14.12 14.12L19.5 19.5M5.636 5.636a9.97 9.97 0 0113.828 0" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="settings-password">New password</Label>
                    <div className="relative">
                      <Input id="settings-password" name="password" type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" aria-describedby="password-help" className="pr-10" />
                      <button type="button" onClick={() => setShowPasswords((v) => !v)} aria-label={showPasswords ? 'Hide password' : 'Show password'} aria-pressed={showPasswords} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring">
                        {showPasswords ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L14.12 14.12m-4.242-4.242L19.5 5.25M14.12 14.12L19.5 19.5M5.636 5.636a9.97 9.97 0 0113.828 0" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-password-confirm">Confirm new password</Label>
                    <div className="relative">
                      <Input id="settings-password-confirm" name="password_confirmation" type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" className="pr-10" />
                      <button type="button" onClick={() => setShowPasswords((v) => !v)} aria-label={showPasswords ? 'Hide password' : 'Show password'} aria-pressed={showPasswords} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring">
                        {showPasswords ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L14.12 14.12m-4.242-4.242L19.5 5.25M14.12 14.12L19.5 19.5M5.636 5.636a9.97 9.97 0 0113.828 0" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p id="password-help" className="text-xs text-muted-foreground">We never store your password. Use a unique, strong password. Click the eye to show.</p>
              </div>
            </section>

            {/* Preferences */}
            <section id="section-preferences" aria-labelledby="preferences-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-border">
                <h2 id="preferences-heading" className="text-base font-semibold text-foreground tracking-tight">Preferences</h2>
                <p className="text-sm text-muted-foreground mt-1">Personalize appearance, language, and content filters.</p>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="settings-language">Language</Label>
                  <div className="relative">
                    <select id="settings-language" name="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 appearance-none">
                      <option value="en">English</option>
                      <option value="id">Indonesian</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Include adult content (18+)</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Show mature titles in Browse, search, and recommendations. You can change this anytime.</p>
                  </div>
                  <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-muted transition-colors has-[input:checked]:bg-red-600 focus-within:ring-2 focus-within:ring-ring">
                    <input id="settings-adult" name="include_adult" type="checkbox" checked={includeAdult} onChange={(e) => setIncludeAdult(e.target.checked)} className="peer sr-only" />
                    <span className="pointer-events-none absolute h-5 w-5 rounded-full bg-white left-0.5 top-0.5 transition-transform peer-checked:translate-x-5 shadow" aria-hidden />
                    <span className="sr-only">Include adult content</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Sticky save bar */}
            <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 bg-gradient-to-t from-background via-background/90 to-transparent sm:bg-none border-t border-border sm:border-0 backdrop-blur sm:backdrop-blur-none">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="hidden sm:block text-xs text-muted-foreground">All changes are saved together.</p>
                <Button type="submit" disabled={isPending} aria-busy={isPending} variant="brand" size="default" className="w-full sm:w-auto min-w-[160px]">
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-hidden />
                      Saving…
                    </span>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
