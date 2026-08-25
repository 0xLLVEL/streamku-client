'use client';

import { useState } from 'react';
import { deleteContentAction } from '@/app/actions/admin-content';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteButtonProps {
  id: number | string;
  type: 'movies' | 'tv-shows' | 'genres' | 'cast';
}

export function DeleteButton({ id, type }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to completely delete this item? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteContentAction(id, type);
    
    if (!res.success) {
      alert(res.error || 'Failed to delete');
      setIsDeleting(false);
    } else {
      queryClient.invalidateQueries({ queryKey: [`admin-${type}`] });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400/70 hover:text-red-400 px-3 py-1.5 rounded-md border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-colors duration-200 text-xs font-medium cursor-pointer focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
