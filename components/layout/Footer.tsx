import Link from 'next/link';

const LINKS = [
  { name: 'Movies', path: '/movies' },
  { name: 'TV Series', path: '/tv' },
  { name: 'Genres', path: '/genres' },
  { name: 'Library', path: '/profile/me' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-12 lg:px-24">
        <Link href="/" className="text-xl font-black tracking-tighter text-red-600" aria-label="Streamku home">
          STREAMKU
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.path} href={link.path} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.name}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Streamku. This product uses the TMDB API but is not endorsed by TMDB.
        </p>
      </div>
    </footer>
  );
}
