'use client';

import { Label } from '@/components/ui/Label';
import type { SettingsForm } from './use-settings-form';

type Props = Pick<SettingsForm, 'language' | 'setLanguage' | 'includeAdult' | 'setIncludeAdult'>;

export function PreferencesSection(p: Props) {
  return (
    <section id="section-preferences" aria-labelledby="preferences-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-border">
        <h2 id="preferences-heading" className="text-base font-semibold text-foreground tracking-tight">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Personalize appearance, language, and content filters.</p>
      </div>
      <div className="p-6 md:p-8 space-y-6">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="settings-language">Language</Label>
          <div className="relative">
            <select id="settings-language" name="language" value={p.language} onChange={(e) => p.setLanguage(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 appearance-none">
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
            <input id="settings-adult" name="include_adult" type="checkbox" checked={p.includeAdult} onChange={(e) => p.setIncludeAdult(e.target.checked)} className="peer sr-only" />
            <span className="pointer-events-none absolute h-5 w-5 rounded-full bg-white left-0.5 top-0.5 transition-transform peer-checked:translate-x-5 shadow" aria-hidden />
            <span className="sr-only">Include adult content</span>
          </label>
        </div>
      </div>
    </section>
  );
}
