import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui';

export default function AdminAddContentPage() {
  return (
    <div className="motion-safe:animate-in fade-in duration-500 w-full text-white font-sans">
      <AdminPageHeader
        title="Add Title"
        description="Choose what you want to add to the catalog"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <TypeChoiceCard
          href="/admin/movies/create"
          title="Movie"
          description="Import from TMDB or create manually, then attach streams and cast."
          icon={<MovieIcon />}
        />
        <TypeChoiceCard
          href="/admin/tv-shows/create"
          title="TV Show"
          description="Create a series, manage seasons and episodes, then attach streams."
          icon={<TvIcon />}
        />
      </div>
    </div>
  );
}

function TypeChoiceCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-[#101014] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_8px_24px_-12px_rgba(0,0,0,0.8)] p-6 transition-all duration-200 hover:border-red-500/30 hover:bg-[#141419] cursor-pointer focus-ring"
    >
      <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center transition-colors duration-200 group-hover:bg-red-600/20 [&_svg]:w-6 [&_svg]:h-6" aria-hidden>
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/50 leading-relaxed">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-400">
        Create
        <ArrowIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function MovieIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
