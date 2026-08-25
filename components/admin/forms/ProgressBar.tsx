import React from 'react';
import { Progress } from '@/components/ui/Progress';

interface ProgressBarProps {
  progress: number;
  status: 'idle' | 'uploading' | 'paused' | 'processing' | 'completed' | 'error';
  message?: string;
  onPause?: () => void;
  onResume?: () => void;
}

export function ProgressBar({ progress, status, message, onPause, onResume }: ProgressBarProps) {
  if (status === 'idle') return null;

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {status === 'completed' ? (
             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          ) : status === 'error' ? (
             <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : status === 'paused' ? (
             <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
             <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          )}
          <span className="font-medium text-white/90 truncate">
            {status === 'completed' ? 'Success!' : status === 'processing' ? 'Processing...' : status === 'paused' ? 'Paused' : status === 'error' ? 'Error' : 'Uploading Video'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
          <span>{message}</span>
          {(status === 'uploading' || status === 'paused') && (
            <span className="text-white/70 font-semibold">{Math.round(progress)}%</span>
          )}
          
          {status === 'uploading' && onPause && (
            <button type="button" onClick={onPause} className="ml-2 hover:text-white transition-colors bg-white/10 px-2 py-0.5 rounded" title="Pause Upload">
              <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          )}
          {status === 'paused' && onResume && (
            <button type="button" onClick={onResume} className="ml-2 hover:text-white transition-colors bg-white/10 px-2 py-0.5 rounded" title="Resume Upload">
              <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          )}
        </div>
      </div>
      {(status === 'uploading' || status === 'paused' || status === 'processing') && (
        <Progress 
          value={status === 'processing' ? 100 : progress} 
          className={`h-1 bg-white/10 ${status === 'paused' ? '[&>div]:bg-orange-500' : '[&>div]:bg-red-500'} ${status === 'processing' || status === 'uploading' ? '[&>div]:animate-pulse' : ''}`}
        />
      )}
    </div>
  );
}
