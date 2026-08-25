'use client';

import { useAuth, type User } from '@/providers/AuthProvider';
import { updateSettingsAction } from '@/app/actions/auth';
import { useActionState, useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  // Controlled inputs; the auth provider supplies the initial user server-side
  const [name, setName] = useState(user?.name ?? '');
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'en');
  const [includeAdult, setIncludeAdult] = useState(user?.preferences?.include_adult ?? false);

  // Sync back to context on success
  useEffect(() => {
    if (state?.success && state.user) {
      setUser(state.user as User);
    }
  }, [state, setUser]);

  if (!user) {
    return (
      <div className="pt-32 px-8 text-center min-h-screen">
        <p className="text-white/50 text-lg">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-8 md:px-16 lg:px-24 min-h-screen">
      <div className="max-w-2xl mx-auto liquid-glass p-8 md:p-12 rounded-3xl relative overflow-hidden">
        {/* Subtle accent glow behind the form */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight relative z-10">Account Settings</h1>
        
        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 text-red-200 border border-red-500/30 relative z-10">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 text-green-200 border border-green-500/30 relative z-10">
            Settings saved successfully!
          </div>
        )}

        <form action={formAction} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-white/70 mb-2">Language</label>
            <div className="relative">
              <select 
                id="language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="id">Indonesian</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input 
              type="checkbox" 
              id="include_adult"
              name="include_adult"
              checked={includeAdult}
              onChange={(e) => setIncludeAdult(e.target.checked)}
              className="w-5 h-5 rounded border-white/10 bg-black/40 text-red-600 focus:ring-red-600 focus:ring-offset-black cursor-pointer"
            />
            <label htmlFor="include_adult" className="text-white/80 font-medium cursor-pointer select-none">
              Include Adult Content (18+)
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 mt-8 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          >
            {isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
