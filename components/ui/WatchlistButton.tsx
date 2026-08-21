'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/apiClient';

interface WatchlistButtonProps {
  watchableId: number;
  watchableType: 'movie' | 'tv_show';
  watchable: any;
}

export function WatchlistButton({ watchableId, watchableType, watchable }: WatchlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdded, setIsAdded] = useState(watchable != null);
  const [watchlistId, setWatchlistId] = useState<number | null>(watchable);

  const handleWatchlist = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isAdded && watchlistId) {
        const res = await fetchApi(`/watchlist/${watchlistId}`, {
          method: 'DELETE',
          requireAuth: true,
        });
        if (res.ok) {
          setSuccess(true);
          setIsAdded(false);
          setWatchlistId(null);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          alert('Failed to remove from watchlist. You might need to login first.');
        }
        return;
      }

      const res = await fetchApi('/watchlist', {
        method: 'POST',
        body: JSON.stringify({
          watchlistable_id: watchableId,
          watchlistable_type: watchableType,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        requireAuth: true,
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        setIsAdded(true);
        if (data?.data?.id) {
          setWatchlistId(data.data.id);
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to add to watchlist. You might need to login first.');
      }
    } catch (err: any) {
      if (err.message.includes('401')) {
        alert('Please login to use this feature.');
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine button classes, icon, and text dynamically based on state
  let btnClass = 'liquid-glass hover:bg-white/20 text-white';
  let icon = null;
  let text = '';

  if (loading) {
    icon = (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
    text = 'Loading';
  } else if (success) {
    if (!isAdded) {
      btnClass = 'bg-red-600 hover:bg-red-700 text-white';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
      text = 'Removed';
    } else {
      btnClass = 'bg-green-600 hover:bg-green-700 text-white';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
      text = 'Added';
    }
  } else {
    if (isAdded) {
      btnClass = 'liquid-glass hover:bg-white/20 text-yellow-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" ><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
      );
      text = 'Watchlisted';
    } else {
      btnClass = 'liquid-glass hover:bg-white/20 text-white';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
      );
      text = 'Watchlist';
    }
  }

  return (
    <button
      onClick={handleWatchlist}
      disabled={loading || success}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-sm font-bold ${btnClass}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
