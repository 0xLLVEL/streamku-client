import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-12 lg:px-24">
        <Link href="/" className="text-xl font-black tracking-tighter text-red-600" aria-label="Streamku home">
          STREAMKU
        </Link>
        <p className="text-center text-xs text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Streamku. This product uses the TMDB API but is not endorsed by TMDB.
        </p>
      </div>
    </footer>
  );
}
