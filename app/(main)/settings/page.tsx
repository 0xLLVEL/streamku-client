'use client';

import { Button } from '@/components/ui/Button';
import { AccountSection } from './AccountSection';
import { PreferencesSection } from './PreferencesSection';
import { ProfileSection } from './ProfileSection';
import { SettingsNav } from './SettingsNav';
import { useSettingsForm } from './use-settings-form';

export default function SettingsPage() {
  const form = useSettingsForm();
  // ponytail: keep the input ref out of the props object — react-hooks/refs
  // forbids passing refs through regular props during render.
  const { fileRef, ...f } = form;
  if (!f.user) {
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
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="mb-8 md:mb-10">
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-foreground leading-none">Settings</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">Manage your profile, account security, and viewing preferences. Changes apply across reviews, comments, and recommendations.</p>
        </div>
        {f.state?.error && (
          <div role="alert" className="mb-6 flex gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span className="min-w-0">{f.state.error}</span>
          </div>
        )}
        {f.state?.success && (
          <div role="status" className="mb-6 flex gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-200">
            <svg className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Settings saved. Your profile is updated everywhere.</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 items-start">
          <SettingsNav activeSection={f.activeSection} onSelect={f.scrollTo} email={f.user.email} />
          <form action={f.formAction} className="space-y-6" aria-labelledby="settings-heading">
            <h2 id="settings-heading" className="sr-only">Account settings</h2>
            <ProfileSection ref={fileRef} username={f.username} setUsername={f.setUsername} nickname={f.nickname} setNickname={f.setNickname} email={f.email} setEmail={f.setEmail} avatarPreview={f.avatarPreview} avatarFile={f.avatarFile} setAvatarFile={f.setAvatarFile} clearAvatar={f.clearAvatar} />
            <AccountSection currentPassword={f.currentPassword} setCurrentPassword={f.setCurrentPassword} newPassword={f.newPassword} setNewPassword={f.setNewPassword} confirmPassword={f.confirmPassword} setConfirmPassword={f.setConfirmPassword} showPasswords={f.showPasswords} setShowPasswords={f.setShowPasswords} />
            <PreferencesSection language={f.language} setLanguage={f.setLanguage} includeAdult={f.includeAdult} setIncludeAdult={f.setIncludeAdult} />
            <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 bg-gradient-to-t from-background via-background/90 to-transparent sm:bg-none border-t border-border sm:border-0 backdrop-blur sm:backdrop-blur-none">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="hidden sm:block text-xs text-muted-foreground">All changes are saved together.</p>
                <Button type="submit" disabled={f.isPending} aria-busy={f.isPending} variant="brand" size="default" className="w-full sm:w-auto min-w-[160px]">
                  {f.isPending ? (<span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-hidden />Saving…</span>) : ('Save changes')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
