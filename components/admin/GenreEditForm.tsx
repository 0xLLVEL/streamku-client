'use client';

import { useState } from 'react';
import { updateGenreAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/components/ui/FormInput';

export function GenreEditForm({ genre }: { genre: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateGenreAction(genre.id, formData);

    if (res.success) {
      setMessage({ text: 'Genre updated successfully!', type: 'success' });
      setTimeout(() => router.push('/admin/genres'), 1000);
    } else {
      setMessage({ text: res.error || 'Failed to update', type: 'error' });
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <FormInput label="Genre Name" name="name" defaultValue={genre.name} />

      <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
        <button type="button" onClick={() => router.push('/admin/genres')} className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all font-bold uppercase tracking-wider text-sm">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
