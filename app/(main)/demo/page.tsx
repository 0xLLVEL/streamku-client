'use client';

import { useState } from 'react';
import { buildEmbedUrl, STREAM_PROVIDERS, type StreamProvider } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export default function DemoPage() {
  const [tmdbId, setTmdbId] = useState('27205');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [provider, setProvider] = useState<StreamProvider>('VidKing');

  const embedUrl = buildEmbedUrl(provider, tmdbId, type, season, episode);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Demo — Streaming Providers</h1>
          <p className="text-sm text-muted-foreground mt-2">Test all 9 embed providers with any TMDB ID. No API key needed — iframe only.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-tmdb">TMDB ID</Label>
              <Input id="demo-tmdb" value={tmdbId} onChange={(e) => setTmdbId(e.target.value.replace(/[^0-9]/g, ''))} placeholder="27205 (Inception)" />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as StreamProvider)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STREAM_PROVIDERS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button type="button" variant={type === 'movie' ? 'brand' : 'secondary'} size="sm" onClick={() => setType('movie')} className="flex-1">Movie</Button>
                <Button type="button" variant={type === 'tv' ? 'brand' : 'secondary'} size="sm" onClick={() => setType('tv')} className="flex-1">TV</Button>
              </div>
            </div>
            {type === 'tv' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="demo-season">Season</Label>
                  <Input id="demo-season" value={season} onChange={(e) => setSeason(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-episode">Episode</Label>
                  <Input id="demo-episode" value={episode} onChange={(e) => setEpisode(e.target.value)} />
                </div>
              </>
            )}
          </div>

          {embedUrl && (
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground break-all">{embedUrl}</p>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-black">
                <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" title="Demo player" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold text-foreground">Providers</h2>
          <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
            {Object.entries(STREAM_PROVIDERS).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary shrink-0" />{v.label} — {v.base}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
