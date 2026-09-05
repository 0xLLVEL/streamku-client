import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <p className="text-sm font-bold tracking-[0.3em] text-red-600">STREAMKU</p>
      <h1 className="text-7xl font-black tracking-tighter text-foreground md:text-8xl">404</h1>
      <p className="max-w-md text-sm text-muted-foreground md:text-base">
        This title is not in our catalog. It may have been removed or the link is wrong.
      </p>
      <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
        <Link href="/" className={cn(buttonVariants({ variant: 'brand', size: 'lg' }))}>
          Back to home
        </Link>
        <Link href="/movies" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}>
          Browse movies
        </Link>
      </div>
    </div>
  );
}
