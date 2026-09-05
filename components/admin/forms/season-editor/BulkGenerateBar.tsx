'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { STREAM_PROVIDERS, type StreamProvider } from '@/lib/config.utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { SeasonFormMessage } from './types';

interface BulkGenerateBarProps {
  totalEpisodes: string;
  onTotalChange: (value: string) => void;
  bulkSite: StreamProvider;
  onSiteChange: (site: StreamProvider) => void;
  isGenerating: boolean;
  generateMessage: SeasonFormMessage | null;
  onGenerate: (e: React.MouseEvent) => void;
}

export function BulkGenerateBar({ totalEpisodes, onTotalChange, bulkSite, onSiteChange, isGenerating, generateMessage, onGenerate }: BulkGenerateBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-white/50">Auto-generate up to:</span>
      <Input type="number" min="1" max="1000" value={totalEpisodes} onChange={(e) => onTotalChange(e.target.value)} className="w-20 h-8 text-sm" />
      <Select value={bulkSite} onValueChange={(v) => onSiteChange(v as StreamProvider)}>
        <SelectTrigger className="w-[140px] h-8 text-xs bg-black/40 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#18181C] border-white/10 text-white">
          {Object.entries(STREAM_PROVIDERS).map(([k, p]) => (
            <SelectItem key={k} value={k} className="text-white focus:bg-white/10 focus:text-white text-xs">{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="brand" size="xs" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : `Bulk Generate ${bulkSite}`}
      </Button>
      {generateMessage && (
        <span className={`text-xs ml-2 ${generateMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {generateMessage.text}
        </span>
      )}
    </div>
  );
}
