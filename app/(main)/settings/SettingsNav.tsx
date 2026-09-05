'use client';

export type SectionId = 'profile' | 'account' | 'preferences';

export const NAV_ITEMS: { id: SectionId; label: string; description: string }[] = [
  { id: 'profile', label: 'Profile', description: 'Avatar & display name' },
  { id: 'account', label: 'Account', description: 'Email & password' },
  { id: 'preferences', label: 'Preferences', description: 'Language & content' },
];

export function SettingsNav({ activeSection, onSelect, email }: { activeSection: SectionId; onSelect: (id: SectionId) => void; email?: string }) {
  return (
    <nav aria-label="Settings sections" className="lg:sticky lg:top-20">
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none" role="tablist">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} role="tab" aria-selected={activeSection === item.id} aria-controls={`section-${item.id}`} onClick={() => onSelect(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors focus-ring ${activeSection === item.id ? 'bg-foreground text-background border-foreground' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="hidden lg:block rounded-2xl border border-border bg-card p-2">
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} aria-current={active ? 'true' : undefined}
              className={`w-full text-left rounded-xl px-3 py-3 flex items-start gap-3 transition-colors focus-ring ${active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <span className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${active ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'}`} aria-hidden>{item.label.charAt(0)}</span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold leading-none ${active ? 'text-background' : 'text-foreground'}`}>{item.label}</span>
                <span className={`block text-xs mt-1 leading-none ${active ? 'text-background/70' : 'text-muted-foreground'}`}>{item.description}</span>
              </span>
            </button>
          );
        })}
        <div className="mt-3 pt-3 border-t border-border px-3 pb-2">
          <p className="text-xs text-muted-foreground leading-relaxed">Signed in as <span className="text-foreground font-medium">{email}</span></p>
        </div>
      </div>
    </nav>
  );
}
