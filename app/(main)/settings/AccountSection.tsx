'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import type { SettingsForm } from './use-settings-form';

type Props = Pick<SettingsForm, 'currentPassword' | 'setCurrentPassword' | 'newPassword' | 'setNewPassword' | 'confirmPassword' | 'setConfirmPassword' | 'showPasswords' | 'setShowPasswords'>;

function EyeButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring">
      {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </button>
  );
}

export function AccountSection(p: Props) {
  const toggle = () => p.setShowPasswords((v) => !v);
  return (
    <section id="section-account" aria-labelledby="account-heading" className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-border">
        <h2 id="account-heading" className="text-base font-semibold text-foreground tracking-tight">Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Change your password. Leave blank to keep the current one.</p>
      </div>
      <div className="p-6 md:p-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="settings-current-password">Current password</Label>
          <div className="relative">
            <Input id="settings-current-password" name="current_password" type={p.showPasswords ? 'text' : 'password'} value={p.currentPassword} onChange={(e) => p.setCurrentPassword(e.target.value)} placeholder="Required to set a new password" autoComplete="current-password" className="pr-10" />
            <EyeButton visible={p.showPasswords} onToggle={toggle} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="settings-password">New password</Label>
            <div className="relative">
              <Input id="settings-password" name="password" type={p.showPasswords ? 'text' : 'password'} value={p.newPassword} onChange={(e) => p.setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" aria-describedby="password-help" className="pr-10" />
              <EyeButton visible={p.showPasswords} onToggle={toggle} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-password-confirm">Confirm new password</Label>
            <div className="relative">
              <Input id="settings-password-confirm" name="password_confirmation" type={p.showPasswords ? 'text' : 'password'} value={p.confirmPassword} onChange={(e) => p.setConfirmPassword(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" className="pr-10" />
              <EyeButton visible={p.showPasswords} onToggle={toggle} />
            </div>
          </div>
        </div>
        <p id="password-help" className="text-xs text-muted-foreground">We never store your password. Use a unique, strong password. Click the eye to show.</p>
      </div>
    </section>
  );
}
