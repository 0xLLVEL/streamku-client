import Link from 'next/link';
import Image from 'next/image';

interface PosterCardProps {
  item: any;
  priority?: boolean;
}

export function PosterCard({ item, priority = false }: PosterCardProps) {
  const isMovie = !!item.title;
  const displayTitle = item.title || item.name;
  const href = isMovie ? `/movie/${item.slug}` : `/tv/${item.slug}`;
  const tmdbBaseUrl = 'https://image.tmdb.org/t/p/w500';

  return (
    <Link href={href} className="group relative block aspect-[2/3] rounded-2xl overflow-hidden liquid-glass flex-shrink-0 w-[160px] md:w-[200px] transition-all duration-500 hover:scale-[1.03] hover:z-10">
      {item.poster_path ? (
        <img
          src={`${tmdbBaseUrl}${item.poster_path}`}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/50 text-center p-4 font-medium">
          No Image
        </div>
      )}
      
      {/* Gradient Overlay on Hover instead of heavy blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 translate-y-4 group-hover:translate-y-0">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{displayTitle}</h3>
        {item.vote_average > 0 && (
          <div className="flex items-center mt-2 text-yellow-300 text-sm font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span className="mr-1">★</span> {item.vote_average}
          </div>
        )}
      </div>
    </Link>
  );
}
