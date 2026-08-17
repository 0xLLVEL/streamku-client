import { fetchApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

async function getMovieMedia(slug: string) {
  const res = await fetchApi(`/movies/${slug}/media`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getMovie(slug: string) {
  const res = await fetchApi(`/movies/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function WatchMoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [movie, media] = await Promise.all([
    getMovie(slug),
    getMovieMedia(slug)
  ]);

  if (!movie) {
    notFound();
  }

  // Find the primary video (usually in 'video' collection)
  let videoData = null;
  if (media && media.video && media.video.length > 0) {
    // Prioritize video with content_type 'Movie', then is_primary, then fallback
    videoData = media.video.find((v: any) => v.metadata?.content_type === 'Movie')
      || media.video.find((v: any) => v.is_primary)
      || media.video[0];
  }

  // Construct the streaming URL
  // Backend URL might run on a specific port for API
  const streamUrl = videoData ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/media/${videoData.id}/stream` : null;
  
  const posterUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;

  return (
    <div className="bg-black min-h-screen w-full">
      {streamUrl ? (
        <VideoPlayer 
          src={streamUrl} 
          title={movie.title}
          poster={posterUrl}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-screen text-center p-6">
          <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Available</h2>
          <p className="text-white/50 max-w-md mx-auto mb-8">
            The media files for this movie have not been uploaded yet or are currently unavailable.
          </p>
          <a href={`/movie/${movie.slug}`} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors">
            Go Back
          </a>
        </div>
      )}
    </div>
  );
}
