'use client';

import { updateEpisodeAction } from '@/app/actions/admin-content-embeds';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { SectionCard } from '@/components/admin/ui';
import { tmdbImageUrl } from '@/lib/config.utils';
import type { EpisodeEditData, EpisodeFormMessage } from './types';

interface EpisodeMetaFormProps {
  tvShowId: number | string;
  seasonNumber: number | string;
  episode: EpisodeEditData;
  setIsSaving: (v: boolean) => void;
  setMessage: (msg: EpisodeFormMessage | null) => void;
}

export function EpisodeMetaForm({ tvShowId, seasonNumber, episode, setIsSaving, setMessage }: EpisodeMetaFormProps) {
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateEpisodeAction(tvShowId, seasonNumber, episode.episode_number, formData);
    setIsSaving(false);

    if (res.success) {
      setMessage({ text: 'Episode updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      router.refresh();
    } else {
      setMessage({ text: res.error || 'Failed to update episode', type: 'error' });
    }
  };

  return (
    <SectionCard title="Episode Details">
      <form id="episode-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-white/50 mb-2">Still Image</label>
            <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-sm">
              {episode.still_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tmdbImageUrl(episode.still_path, 'w300') ?? undefined} alt="Still" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-sm">No Photo</span>
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={episode.name ?? ''} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="air_date">Air Date</Label>
                <Input type="date" id="air_date" name="air_date" defaultValue={episode.air_date ? episode.air_date.split('T')[0] : ''} className="[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runtime">Runtime (minutes)</Label>
                <Input type="number" id="runtime" name="runtime" defaultValue={episode.runtime || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea id="overview" name="overview" defaultValue={episode.overview ?? ''} rows={5} />
            </div>
          </div>
        </div>
      </form>
    </SectionCard>
  );
}
