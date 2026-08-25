'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  createMovieAction,
  deleteEmbedVideoAction,
  importMovieFromTmdbAction,
  previewTmdbMovieAction,
  searchTmdbAction,
  updateMovieAction,
} from '@/app/actions/admin-content';
import {
  EditFormShell,
  TabPanel,
} from '@/components/admin/edit-form/EditFormShell';
import { PrimaryFactsTab, type TitleFieldConfig } from '@/components/admin/edit-form/PrimaryFactsTab';
import { ImagesTab } from '@/components/admin/edit-form/ImagesTab';
import { StreamsTab } from '@/components/admin/edit-form/StreamsTab';
import { CastTab, UnderConstructionPanel } from '@/components/admin/edit-form/CastTab';
import { ImagePreviewModal } from '@/components/admin/edit-form/ImagePreviewModal';
import { useTitleSave } from '@/components/admin/edit-form/useTitleSave';
import type { FormMessage, TitleDisplayData } from '@/components/admin/edit-form/types';

const MOVIE_FIELDS: TitleFieldConfig = {
  titleName: 'title',
  titleLabel: 'Title',
  dateName: 'release_date',
  dateLabel: 'Release date',
  statusOptions: ['Released', 'Post Production', 'Rumored'],
  statusDefault: 'Released',
  metric: { name: 'runtime', label: 'Runtime (minutes)' },
  overviewRows: 4,
};

interface MovieEditFormProps {
  movie?: TitleDisplayData;
}

export function MovieEditForm({ movie }: MovieEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('primary_facts');
  const [previewData, setPreviewData] = useState<TitleDisplayData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const displayData = previewData ?? movie ?? EMPTY_MOVIE;

  const saveMutation = useTitleSave({
    existingId: movie?.id ?? null,
    previewTmdbId: previewData?.tmdb_id ?? null,
    actions: {
      importFromTmdb: importMovieFromTmdbAction,
      create: createMovieAction,
      update: updateMovieAction,
    },
    onSuccess: ({ targetId, createdId }) => {
      setMessage({ text: 'Movie saved successfully!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setTimeout(() => {
        setMessage(null);
        if (!movie?.id && (targetId || createdId)) {
          router.push(`/admin/movies/${targetId ?? createdId}`);
        }
      }, 2000);
    },
    onError: (error) => setMessage({ text: error, type: 'error' }),
  });

  const handleTmdbImport = async (tmdbId: string) => {
    if (!tmdbId) return;
    setMessage(null);

    const res = await previewTmdbMovieAction(tmdbId);
    if (!res.success || !res.data) {
      setMessage({ text: res.error || 'Failed to import preview', type: 'error' });
      return;
    }

    const data = res.data;
    setPreviewData({
      id: null,
      tmdb_id: data.id,
      title: data.title,
      overview: data.overview,
      tagline: data.tagline,
      trailer_url: extractTrailerUrl(data.videos?.results),
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      original_language: data.original_language,
      status: data.status,
      genres: data.genres,
      cast: data.credits?.cast ?? [],
      images: data.images,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
    });
    setMessage({
      text: 'Movie data loaded for preview. Review fields and click Save.',
      type: 'success',
    });
  };

  const handleDeleteEmbedVideo = async (videoId: string | number) => {
    if (!movie?.id || !confirm('Are you sure you want to delete this stream?')) return;

    const res = await deleteEmbedVideoAction({
      mediableId: movie.id,
      mediableType: 'movie',
      videoId,
    });

    if (res.success) {
      setMessage({ text: 'Stream deleted successfully', type: 'success' });
      router.refresh();
    } else {
      setMessage({ text: res.error || 'Failed to delete stream', type: 'error' });
    }
  };

  const tabs = [
    { id: 'primary_facts', label: 'Overview' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Streams' },
    { id: 'cast', label: 'Cast' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <>
      <EditFormShell
        heading={movie ? `Edit "${displayData.title}"` : 'Create Movie'}
        backHref="/admin/movies"
        viewHref={movie?.slug ? `/movies/${movie.slug}` : undefined}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        message={message}
        isSaving={saveMutation.isPending}
        onSubmit={(formData) => {
          setMessage(null);
          if (!formData.get('is_featured')) {
            formData.set('is_featured', '');
          }
          saveMutation.mutate(formData);
        }}
        contentKey={String(displayData.tmdb_id ?? displayData.id ?? 'new')}
      >
        <TabPanel isActive={activeTab === 'primary_facts'}>
          <PrimaryFactsTab
            data={displayData}
            fields={MOVIE_FIELDS}
            isExistingRecord={Boolean(movie)}
            importSearchPlaceholder="Search for a movie..."
            importSearchAction={(query) => searchTmdbAction(query, 'movie')}
            onImportTmdb={(tmdbId) => void handleTmdbImport(tmdbId)}
          />
        </TabPanel>

        <TabPanel isActive={activeTab === 'images'}>
          <ImagesTab
            images={displayData.images}
            posterPath={displayData.poster_path}
            backdropPath={displayData.backdrop_path}
            onPreview={setPreviewImage}
            onDeleteImage={() =>
              setMessage({ text: 'Image deletion is not implemented yet.', type: 'error' })
            }
          />
        </TabPanel>

        <TabPanel isActive={activeTab === 'videos'}>
          <StreamsTab
            titleId={movie?.id ?? null}
            titleName={displayData.title ?? ''}
            posterPath={displayData.poster_path}
            tmdbId={displayData.tmdb_id}
            media={displayData.media}
            videos={displayData.videos}
            onDeleteEmbedVideo={(videoId) => void handleDeleteEmbedVideo(videoId)}
          />
        </TabPanel>

        <TabPanel isActive={activeTab === 'cast'}>
          <CastTab cast={displayData.cast} />
        </TabPanel>

        <TabPanel isActive={activeTab === 'reviews' || activeTab === 'comments'}>
          <UnderConstructionPanel label={tabs.find((tab) => tab.id === activeTab)?.label ?? ''} />
        </TabPanel>
      </EditFormShell>

      {previewImage && (
        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </>
  );
}

const EMPTY_MOVIE: TitleDisplayData = { id: null };

interface TmdbVideoResultItem {
  type?: string;
  site?: string;
  key?: string;
}

function extractTrailerUrl(videos?: TmdbVideoResultItem[] | null): string | null {
  const trailerKey = videos?.find((video) => video.type === 'Trailer' && video.site === 'YouTube')?.key;
  return trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;
}
