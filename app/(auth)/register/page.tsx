'use client';

import { useActionState, useState } from 'react';
import { registerAction } from '@/app/actions/auth';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordField } from '@/components/auth/PasswordField';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Streamku and start watching today."
      error={state?.error}
      wide
      footer={<p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4 focus-ring rounded">Sign in</Link></p>}
      bottomNote="By creating an account, you agree to our Terms and Privacy Policy.">
      <form action={formAction} className="space-y-4" aria-labelledby="register-heading">
        <h2 id="register-heading" className="sr-only">Create a new account</h2>
        <div className="space-y-2">
          <Label htmlFor="register-username">Username</Label>
          <Input id="register-username" name="username" required autoComplete="username" placeholder="streamku_fan" className="bg-background" />
          <p className="text-xs text-muted-foreground">Letters, numbers, underscore. 3–30 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input id="register-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <PasswordField id="register-password" name="password" autoComplete="new-password" placeholder="At least 8 characters" visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input id="register-confirm" name="password_confirmation" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" placeholder="Repeat password" className="bg-background" />
        </div>
        <Button type="submit" variant="brand" className="w-full mt-2 shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)]" disabled={isPending} aria-busy={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
