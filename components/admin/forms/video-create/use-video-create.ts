'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client.utils';
import { useTusUpload } from '@/hooks/use-tus-upload';
import { buildEmbedUrl, parseProviderId } from '@/lib/config.utils';
import { createEmbedVideoAction } from '@/app/actions/admin-content-embeds';
import { isProviderSource, type SourceType } from './constants';

export interface VideoCreateFormProps {
  mediableId: number;
  mediableType: 'movie' | 'episode' | 'tv-show';
  parentTitle: string;
  parentPoster?: string;
  parentTmdbId?: number | string;
  tvShowId?: number | string;
  seasonNumber?: number | string;
  onClose?: () => void;
  inline?: boolean;
  existingVideoQualityIds?: number[];
}

export interface QualityOption {
  id: number | string;
  name?: string;
  label?: string;
}

export function useVideoCreate({ mediableId, mediableType, parentTitle, parentTmdbId, tvShowId, seasonNumber, onClose, inline = false, existingVideoQualityIds = [] }: VideoCreateFormProps) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<SourceType>('Upload');
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [quality, setQuality] = useState('');
  const [language, setLanguage] = useState('English');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [providerInput, setProviderInput] = useState(parentTmdbId ? String(parentTmdbId) : '');
  const [isSavingEmbed, setIsSavingEmbed] = useState(false);
  const [embedSaveMessage, setEmbedSaveMessage] = useState('');
  const [embedSaveStatus, setEmbedSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const tus = useTusUpload({
    onSuccess: () => {
      setVideoFile(null);
      if (qualities.length > 0) {
        const availableQ = qualities.find((q) => !existingVideoQualityIds.includes(Number(q.id)));
        if (availableQ) setQuality(availableQ.id.toString());
        else setQuality('');
      }
      setTimeout(() => { if (onClose) onClose(); router.refresh(); }, 1000);
    }
  });

  useEffect(() => {
    const fetchQualities = async () => {
      try {
        const res = await apiFetch('admin/qualities');
        const json = await res.json();
        const qs: QualityOption[] = json.data || [];
        setQualities(qs);
        if (qs.length > 0) {
          const availableQ = qs.find((q) => !existingVideoQualityIds.includes(Number(q.id)));
          if (availableQ) setQuality(availableQ.id.toString());
          else setQuality(qs[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch qualities', err);
      }
    };
    fetchQualities();
  }, [existingVideoQualityIds]);

  const providerId = useMemo(() => {
    if (!isProviderSource(sourceType)) return null;
    return parseProviderId(sourceType, providerInput);
  }, [providerInput, sourceType]);
  const providerError = providerInput.trim() && !providerId && isProviderSource(sourceType)
    ? `Could not extract a ${sourceType} ID from this URL.` : '';
  const providerPreviewUrl = useMemo(() => {
    if (!isProviderSource(sourceType) || !providerId) return null;
    return buildEmbedUrl(sourceType, providerId, mediableType === 'movie' ? 'movie' : 'tv');
  }, [sourceType, providerId, mediableType]);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      tus.setStatus('idle');
      tus.setMessage('');
      if (!name) {
        setName(e.target.files[0].name.replace(/\.[^/.]+$/, '').substring(0, 100));
      }
    }
  };

  const handleSaveProvider = async () => {
    if (!providerId || !isProviderSource(sourceType)) return;
    setIsSavingEmbed(true);
    setEmbedSaveStatus('idle');
    setEmbedSaveMessage('');
    const res = await createEmbedVideoAction({
      mediableId,
      mediableType: mediableType as 'movie' | 'tv-show' | 'episode',
      tvShowId,
      seasonNumber,
      key: providerId,
      site: sourceType,
      name: name || parentTitle || 'Stream',
    });
    setIsSavingEmbed(false);
    if (res.success) {
      setEmbedSaveStatus('success');
      setEmbedSaveMessage('Stream saved successfully!');
      setProviderInput('');
      setTimeout(() => { if (onClose) onClose(); router.refresh(); }, 1200);
    } else {
      setEmbedSaveStatus('error');
      setEmbedSaveMessage(res.error || 'Failed to save stream.');
    }
  };

  const handleSave = async () => {
    if (isProviderSource(sourceType)) {
      await handleSaveProvider();
      return;
    }
    if (sourceType === 'Upload') {
      if (!videoFile) {
        tus.setMessage('Please select a video file first.');
        tus.setStatus('error');
        return;
      }
      tus.startUpload(videoFile, {
        mediable_id: mediableId.toString(),
        mediable_type: mediableType,
        quality_id: quality,
        type: 'video',
        collection: 'video',
        label: (inline && parentTitle) ? parentTitle.substring(0, 100) : (name ? name.substring(0, 100) : ''),
        language: language,
      });
    }
  };

  const isProvider = isProviderSource(sourceType);
  const isSaveDisabled = tus.status === 'uploading' || tus.status === 'processing' || isSavingEmbed ||
    (sourceType === 'Upload' && !quality) || (isProvider && !providerId);

  return {
    sourceType, setSourceType, season, setSeason, quality, setQuality, language, setLanguage,
    videoFile, providerInput, setProviderInput, isSavingEmbed, embedSaveMessage, embedSaveStatus,
    qualities, existingVideoQualityIds, tusStatus: tus.status, tusProgress: tus.progress, tusMessage: tus.message,
    pauseUpload: tus.pauseUpload, resumeUpload: tus.resumeUpload, providerId, providerError, providerPreviewUrl,
    isProvider, isSaveDisabled, handleVideoFileChange, handleSave,
  };
}
