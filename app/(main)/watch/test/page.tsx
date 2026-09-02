import { VideoPlayer } from '@/components/media/VideoPlayer';

export default function WatchTestPage() {
  return (
    <div className="bg-black min-h-screen w-full">
      <VideoPlayer
        src="https://media.w3.org/2010/05/sintel/trailer.mp4"
        title="Sintel — Trailer"
        poster="https://media.w3.org/2010/05/sintel/poster.png"
      />
    </div>
  );
}
