'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/apiClient';

interface FavoriteButtonProps {
  favoritableId: number;
  favoritableType: 'movie' | 'tv_show';
  favorite: any;
}

export function FavoriteButton({ favoritableId, favoritableType, favorite }: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdded, setIsAdded] = useState(favorite != null);
  const [favoriteId, setFavoriteId] = useState<number | null>(favorite);

  const handleFavorite = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isAdded && favoriteId) {
        const res = await fetchApi(`/favorites/${favoriteId}`, {
          method: 'DELETE',
          requireAuth: true,
        });
        if (res.ok) {
          setSuccess(true);
          setIsAdded(false);
          setFavoriteId(null);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          alert('Failed to remove from favorites. You might need to login first.');
        }
        return;
      }
      
      const res = await fetchApi('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          favoritable_id: favoritableId,
          favoritable_type: favoritableType,
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
          setFavoriteId(data.data.id);
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to add to favorites. You might need to login first.');
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
      btnClass = 'liquid-glass hover:bg-white/20 text-rose-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      );
      text = 'Favorited';
    } else {
      btnClass = 'liquid-glass hover:bg-white/20 text-white';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
      text = 'Favorite';
    }
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={loading || success}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-sm font-bold ${btnClass}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
