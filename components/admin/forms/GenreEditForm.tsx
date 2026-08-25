'use client';

import { useState } from 'react';
import { updateGenreAction } from '@/app/actions/admin-content';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button, buttonVariants } from '@/components/ui/Button';
import { SectionCard } from '@/components/admin/ui';

interface GenreEditData {
  id: number;
  name: string;
}

export function GenreEditForm({ genre }: { genre: GenreEditData }) {
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

      <SectionCard title="Genre">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-white/60 uppercase tracking-wider block">Genre Name</Label>
          <Input id="name" name="name" defaultValue={genre.name} />
        </div>
      </SectionCard>

      <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
        <Link href="/admin/genres" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Cancel
        </Link>
        <Button type="submit" variant="brand" size="sm" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
