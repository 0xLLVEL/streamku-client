import { STREAM_PROVIDERS, type StreamProvider } from '@/lib/config.utils';

export type SourceType = 'Upload' | StreamProvider;

export const PROVIDER_OPTIONS = Object.entries(STREAM_PROVIDERS) as [StreamProvider, { label: string; base: string }][];

export function isProviderSource(v: string): v is StreamProvider {
  return v in STREAM_PROVIDERS;
}
