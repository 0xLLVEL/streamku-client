'use client';

import { useState } from 'react';
import { bulkDeleteContentAction } from '@/app/actions/admin-content';
import { useQueryClient } from '@tanstack/react-query';

interface BulkDeleteButtonProps {
  selectedIds: (number | string)[];
  type: 'movies' | 'tv-shows' | 'genres' | 'cast';
  onSuccess?: () => void;
}

export function BulkDeleteButton({ selectedIds, type, onSuccess }: BulkDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const count = selectedIds.length;
  if (count === 0) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to completely delete ${count} selected item(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const res = await bulkDeleteContentAction(selectedIds, type);
    
    if (!res.success) {
      alert(res.error || 'Failed to delete some items');
    } else {
      queryClient.invalidateQueries({ queryKey: [`admin-${type}`] });
      onSuccess?.();
    }
    
    setIsDeleting(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      {isDeleting ? 'Deleting...' : `Delete Selected (${count})`}
    </button>
  );
}
