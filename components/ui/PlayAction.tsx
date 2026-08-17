'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface PlayActionProps {
  mediaEndpoint: string;
  title: string;
  poster: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function PlayAction({ 
  mediaEndpoint, 
  title, 
  poster, 
  label = "Play", 
  className, 
  icon 
}: PlayActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (streamUrl) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${baseUrl}${mediaEndpoint}`);
      
      if (!res.ok) throw new Error('Failed to load media');
      
      const json = await res.json();
      const media = json.data;
      
      let videoData = null;
      if (media && media.video && media.video.length > 0) {
        videoData = media.video.find((v: any) => v.metadata?.content_type === 'Movie')
          || media.video.find((v: any) => v.is_primary)
          || media.video[0];
      }

      if (videoData) {
        setStreamUrl(`${baseUrl}/media/${videoData.id}/stream`);
        setIsOpen(true);
      } else {
        setError('Media not available');
        alert('Video not available yet. Please upload it first.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handlePlayClick} className={className} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {icon || <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
            {label}
          </span>
        )}
      </button>

      {mounted && isOpen && streamUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
           <VideoPlayer 
             src={streamUrl} 
             title={title} 
             poster={poster} 
             onBack={() => setIsOpen(false)} 
           />
        </div>,
        document.body
      )}
    </>
  );
}
