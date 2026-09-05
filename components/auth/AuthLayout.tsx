import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { tmdbImageUrl } from '@/lib/config.utils';
import { BG_POSTERS } from '@/lib/auth-posters.utils';

export function AuthLayout({ title, subtitle, error, children, footer, bottomNote, wide }: {
  title: string; subtitle: string; error?: string | null;
  children: React.ReactNode; footer: React.ReactNode; bottomNote: string; wide?: boolean;
}) {
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
            <pattern id="auth-dots" width="20" height="20" patternUnits="userSpaceOnUse" x="0" y="0">
              <circle cx="1" cy="1" r="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dots)" />
        </svg>
      </div>
      <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 sm:p-6 pt-24">
        <div className={`w-full ${wide ? 'max-w-[440px]' : 'max-w-[400px]'}`}>
          <div className="overflow-hidden rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400" aria-hidden />
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </div>
              {error && <div role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">{error}</div>}
              {children}
              <div className="mt-6 flex items-center gap-3" aria-hidden>
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              {footer}
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground px-4">{bottomNote}</p>
        </div>
      </main>
    </div>
  );
}
