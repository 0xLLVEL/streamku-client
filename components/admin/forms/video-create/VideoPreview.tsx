import type { SourceType } from './constants';

interface VideoPreviewProps {
  sourceType: SourceType;
  isProvider: boolean;
  providerId: string | null;
  providerPreviewUrl: string | null;
  videoFile: File | null;
}

export function VideoPreview({ sourceType, isProvider, providerId, providerPreviewUrl, videoFile }: VideoPreviewProps) {
  if (isProvider && providerId && providerPreviewUrl) {
    return (
      <div className="aspect-video bg-black/30 rounded-xl overflow-hidden shadow-lg border border-white/5 relative">
        <iframe
          src={providerPreviewUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          title={`${sourceType} Preview`}
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded-md">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/80 font-medium">{sourceType} Preview</span>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
      {videoFile ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <h4 className="text-white font-medium text-lg">{videoFile.name}</h4>
          <p className="text-white/40 text-sm mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
        </div>
      ) : isProvider ? (
        <div className="flex flex-col items-center gap-3 text-white/30">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-sm">Enter a {sourceType} URL to preview</p>
        </div>
      ) : (
        <button aria-label="Play preview" className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer focus-ring">
          <svg className="w-8 h-8 text-white/40 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
        </button>
      )}
    </div>
  );
}
