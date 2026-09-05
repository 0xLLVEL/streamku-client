'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordField } from '@/components/auth/PasswordField';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your watchlist."
      error={state?.error}
      footer={<p className="mt-6 text-center text-sm text-muted-foreground">New to Streamku? <Link href="/register" className="font-medium text-foreground hover:underline underline-offset-4 focus-ring rounded">Create account</Link></p>}
      bottomNote="By continuing, you agree to our Terms and Privacy Policy.">
      <form action={formAction} className="space-y-4" aria-labelledby="login-heading">
        <h2 id="login-heading" className="sr-only">Sign in to Streamku</h2>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email or username</Label>
          <Input id="login-email" name="email" type="email" required autoComplete="username" placeholder="you@example.com" className="bg-background" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-ring rounded">Forgot password?</Link>
          </div>
          <PasswordField id="login-password" name="password" autoComplete="current-password" placeholder="••••••••" visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
        <Button type="submit" variant="brand" className="w-full mt-2 shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)]" disabled={isPending} aria-busy={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
