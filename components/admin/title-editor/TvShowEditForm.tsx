'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  createTvShowAction,
  importTvShowFromTmdbAction,
  previewTmdbTvAction,
  searchTmdbAction,
  updateTvShowAction,
} from '@/app/actions/admin-content-media';
import { deleteSeasonAction } from '@/app/actions/admin-content-embeds';
import {
  EditFormShell,
  TabPanel,
} from './EditFormShell';
import { PrimaryFactsTab, type TitleFieldConfig } from './PrimaryFactsTab';
import { ImagesTab } from './ImagesTab';
import { SeasonsTab } from './SeasonsTab';
import { CastTab, UnderConstructionPanel } from './CastTab';
import { ImagePreviewModal } from './ImagePreviewModal';
import { useTitleSave } from './useTitleSave';
import type { FormMessage, TitleDisplayData } from './types';

const TV_SHOW_FIELDS: TitleFieldConfig = {
  titleName: 'name',
  titleLabel: 'Name',
  dateName: 'first_air_date',
  dateLabel: 'First air date',
  statusOptions: ['Returning Series', 'Ended', 'Canceled', 'In Production'],
  statusDefault: 'Returning Series',
  metric: { name: 'number_of_seasons', label: 'Number of seasons', readOnly: true },
  overviewRows: 5,
};

interface TvShowEditFormProps {
  tvShow?: TitleDisplayData;
}

export function TvShowEditForm({ tvShow }: TvShowEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('primary_facts');
  const [previewData, setPreviewData] = useState<TitleDisplayData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [deletingSeasonNumber, setDeletingSeasonNumber] = useState<number | string | null>(null);

  const displayData = previewData ?? tvShow ?? EMPTY_TV_SHOW;

  const saveMutation = useTitleSave({
    existingId: tvShow?.id ?? null,
    previewTmdbId: previewData?.tmdb_id ?? null,
    actions: {
      importFromTmdb: importTvShowFromTmdbAction,
      create: createTvShowAction,
      update: updateTvShowAction,
    },
    onSuccess: ({ targetId, createdId }) => {
      setMessage({ text: 'TV Show saved successfully!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      setTimeout(() => {
        setMessage(null);
        if (!tvShow?.id && (targetId || createdId)) {
          router.push(`/admin/tv-shows/${targetId ?? createdId}`);
        }
      }, 2000);
    },
    onError: (error) => setMessage({ text: error, type: 'error' }),
  });

  const handleTmdbImport = async (tmdbId: string) => {
    if (!tmdbId) return;
    setMessage(null);

    const res = await previewTmdbTvAction(tmdbId);
    if (!res.success || !res.data) {
      setMessage({ text: res.error || 'Failed to import preview', type: 'error' });
      return;
    }

    const data = res.data;
    setPreviewData({
      id: null,
      tmdb_id: data.id,
      name: data.name,
      overview: data.overview,
      tagline: data.tagline,
      trailer_url: extractTrailerUrl(data.videos?.results),
      first_air_date: data.first_air_date,
      number_of_seasons: data.number_of_seasons,
      popularity: data.popularity,
      original_language: data.original_language,
      status: data.status,
      genres: data.genres,
      cast: data.credits?.cast ?? [],
      images: data.images,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      seasons: data.seasons ?? [],
    });
    setMessage({
      text: 'TV Show data loaded for preview. Review fields and click Save.',
      type: 'success',
    });
  };

  const handleDeleteSeason = async (seasonNumber: number | string) => {
    if (!tvShow?.id) return;
    if (
      !confirm(
        'Are you sure you want to completely delete this season and all its episodes? This action cannot be undone.',
      )
    ) {
      return;
    }

    setDeletingSeasonNumber(seasonNumber);
    const res = await deleteSeasonAction(tvShow.id, seasonNumber);

    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete season');
    }
    setDeletingSeasonNumber(null);
  };

  const tabs = [
    { id: 'primary_facts', label: 'Overview' },
    { id: 'seasons', label: 'Seasons' },
    { id: 'images', label: 'Images' },
    { id: 'cast', label: 'Cast' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <>
      <EditFormShell
        heading={tvShow ? `Edit "${displayData.name}"` : 'Create TV Show'}
        backHref="/admin/tv-shows"
        viewHref={tvShow?.slug ? `/tv-shows/${tvShow.slug}` : undefined}
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
            fields={TV_SHOW_FIELDS}
            isExistingRecord={Boolean(tvShow)}
            importSearchPlaceholder="Search for a TV show..."
            importSearchAction={(query) => searchTmdbAction(query, 'tv')}
            onImportTmdb={(tmdbId) => void handleTmdbImport(tmdbId)}
          />
        </TabPanel>

        <TabPanel isActive={activeTab === 'seasons'}>
          <SeasonsTab
            tvShowId={tvShow?.id ?? null}
            seasons={displayData.seasons}
            deletingSeasonNumber={deletingSeasonNumber}
            onDeleteSeason={(seasonNumber) => void handleDeleteSeason(seasonNumber)}
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

const EMPTY_TV_SHOW: TitleDisplayData = { id: null };

interface TmdbVideoResultItem {
  type?: string;
  site?: string;
  key?: string;
}

function extractTrailerUrl(videos?: TmdbVideoResultItem[] | null): string | null {
  const trailerKey = videos?.find((video) => video.type === 'Trailer' && video.site === 'YouTube')?.key;
  return trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;
}
