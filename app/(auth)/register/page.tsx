'use client';

import { useActionState, useState } from 'react';
import { registerAction } from '@/app/actions/auth';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/config';

const BG_POSTERS = [
  '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
  '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
  '/bZubW4eLAk2zqk44fSWRDTFfcba.jpg',
  '/8mmpltkcG9areafsQHXaURedno3.jpg',
  '/5aj8vVGFwGVbQQs26ywhg4Zxk2L.jpg',
  '/dEsuQOZwdaFAVL26RjgjwGl9j7m.jpg',
  '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
  '/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
];

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 opacity-30 grid grid-cols-4 gap-2 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              <Image src={tmdbImageUrl(BG_POSTERS[i % BG_POSTERS.length], 'w342') ?? ''} alt="" fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        <svg aria-hidden className="absolute inset-0 h-full w-full fill-white/10 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]">
          <defs>
            <pattern id="register-dots" width="20" height="20" patternUnits="userSpaceOnUse" x="0" y="0">
              <circle cx="1" cy="1" r="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#register-dots)" />
        </svg>
      </div>

      <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 sm:p-6 pt-24">
        <div className="w-full max-w-[440px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400" aria-hidden />
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Create an account</h1>
                <p className="mt-1 text-sm text-muted-foreground">Join Streamku and start watching today.</p>
              </div>

              {state?.error && (
                <div role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
                  {state.error}
                </div>
              )}

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
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="pr-10 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirm password</Label>
                  <Input id="register-confirm" name="password_confirmation" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" placeholder="Repeat password" className="bg-background" />
                </div>

                <Button type="submit" variant="brand" className="w-full mt-2 shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)]" disabled={isPending} aria-busy={isPending}>
                  {isPending ? 'Creating account…' : 'Create account'}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-3" aria-hidden>
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4 focus-ring rounded">Sign in</Link>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground px-4">By creating an account, you agree to our Terms and Privacy Policy.</p>
        </div>
      </main>
    </div>
  );
}
