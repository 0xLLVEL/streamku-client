/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth, type User } from '@/providers/AuthProvider';
import { updateSettingsAction } from '@/app/actions/auth';
import { useActionState, useEffect, useState, useRef } from 'react';
import { avatarUrl } from '@/lib/config';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  const [username, setUsername] = useState((user as unknown as { username?: string })?.username ?? user?.name ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'en');
  const [includeAdult, setIncludeAdult] = useState(user?.preferences?.include_adult ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl(user?.avatar) ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success && state.user) setUser(state.user as User);
  }, [state, setUser]);

  // Keep form fields in sync when user loads/updates (e.g. after login)
  useEffect(() => {
    if (user) {
      setUsername((user as unknown as { username?: string })?.username ?? user.name ?? '');
      setNickname(user.nickname ?? '');
      setLanguage(user.preferences?.language ?? 'en');
      setIncludeAdult(!!user.preferences?.include_adult);
    }
  }, [user, (user as unknown as { username?: string })?.username, user?.nickname, user?.preferences?.language, user?.preferences?.include_adult]);

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
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4" aria-hidden>
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-white">Sign in required</h2>
        <p className="text-sm text-white/50 mt-1">Please log in to manage your profile.</p>
        <a href="/login" className="mt-6 px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors">Go to login</a>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 lg:px-24 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
          <p className="text-sm text-white/50 mt-1">Manage your profile and how Streamku personalizes for you.</p>
        </div>

        {state?.error && <div role="alert" className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/20 text-red-200 text-sm">{state.error}</div>}
        {state?.success && <div role="status" className="mb-6 p-4 rounded-2xl bg-green-500/15 border border-green-500/20 text-green-200 text-sm">Settings saved — updated across your profile, reviews and comments.</div>}

        <form action={formAction} className="space-y-6" aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="sr-only">Account settings</h2>

          {/* Profile Card */}
          <fieldset className="liquid-glass rounded-3xl p-6 md:p-8 border border-white/10">
            <legend className="text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" aria-hidden>
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span> Profile
            </legend>
            <p className="text-sm text-white/40 mt-1 mb-6">This is how others see you — avatar and <span className="text-white/60 font-mono text-xs">@nickname</span> in reviews and comments.</p>

            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-2xl border-2 border-white/10 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {avatarPreview ? <img src={avatarPreview} alt={`${username || (user as unknown as { username?: string })?.username || ''} avatar`} className="w-full h-full object-cover" /> : ((user.nickname || (user as unknown as { username?: string })?.username || user.name || 'U') as string).charAt(0).toUpperCase()}
                </div>
                <input ref={fileRef} type="file" name="avatar" accept="image/*" className="hidden" onChange={e => setAvatarFile(e.target.files?.[0] ?? null)} aria-label="Upload avatar" />
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-bold px-4 py-1.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                  {avatarFile ? 'Change photo' : 'Upload photo'}
                </button>
                {avatarPreview && (
                  <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-white/50 hover:text-white focus-visible:outline-none focus-visible:text-white">
                    Remove
                  </button>
                )}
                <span className="text-[11px] text-white/30">JPG, PNG • max 2 MB</span>
              </div>

              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {avatarPreview ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" /> : (nickname || username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{nickname ? `@${nickname}` : username || 'Your nickname'}</p>
                    <p className="text-xs text-white/40">Preview — others see @nickname</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-username" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Username</label>
                  <input id="settings-username" type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" autoComplete="username" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-colors" />
                </div>
                <div>
                  <label htmlFor="settings-nickname" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Nickname <span className="normal-case font-normal text-white/30">@username</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 select-none" aria-hidden>@</span>
                    <input id="settings-nickname" type="text" name="nickname" value={nickname} onChange={e => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="streamku_fan" maxLength={30} aria-describedby="nickname-help" autoComplete="username" className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-colors" />
                  </div>
                  <p id="nickname-help" className="text-[11px] text-white/35 mt-1.5">Lowercase letters, numbers, underscore. Shown as @nickname.</p>
                </div>
                <div>
                  <label htmlFor="settings-email" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Email</label>
                  <input id="settings-email" value={user.email} disabled aria-disabled="true" className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed" />
                  <p className="text-[11px] text-white/30 mt-1">Email cannot be changed here.</p>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Preferences Card */}
          <fieldset className="liquid-glass rounded-3xl p-6 md:p-8 border border-white/10">
            <legend className="text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" aria-hidden>
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span> Preferences
            </legend>
            <p className="text-sm text-white/40 mt-1 mb-6">Language and sensitive-content filtering.</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="settings-language" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Language</label>
                <div className="relative">
                  <select id="settings-language" name="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 appearance-none cursor-pointer">
                    <option value="en">English</option>
                    <option value="id">Indonesian</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/40" aria-hidden>▼</div>
                </div>
              </div>

              <label htmlFor="settings-adult" className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors focus-within:ring-2 focus-within:ring-white/10">
                <div>
                  <p className="text-white font-semibold text-sm">Include Adult Content (18+)</p>
                  <p className="text-white/40 text-xs mt-0.5">Show mature titles in browse and recommendations.</p>
                </div>
                <input id="settings-adult" type="checkbox" name="include_adult" checked={includeAdult} onChange={e => setIncludeAdult(e.target.checked)} className="w-11 h-6 rounded-full appearance-none bg-white/10 checked:bg-red-600 relative before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shrink-0" />
              </label>
            </div>
          </fieldset>

          <button type="submit" disabled={isPending} aria-busy={isPending} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex items-center justify-center gap-2">
            {isPending ? (<><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden /><span>Saving…</span></>) : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
