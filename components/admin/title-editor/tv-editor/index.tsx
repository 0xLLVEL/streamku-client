'use client';

import { searchTmdbAction } from '@/app/actions/admin-content-media';
import { EditFormShell, TabPanel } from '../EditFormShell';
import { PrimaryFactsTab } from '../PrimaryFactsTab';
import { ImagesTab } from '../ImagesTab';
import { SeasonsTab } from '../SeasonsTab';
import { CastTab, UnderConstructionPanel } from '../CastTab';
import { ImagePreviewModal } from '../ImagePreviewModal';
import { TV_SHOW_FIELDS, TV_TABS } from './constants';
import { useTvEditor } from './hooks/use-tv-editor';
import { useTmdbImport } from './hooks/use-tmdb-import';
import { useDeleteSeason } from './hooks/use-delete-season';
import type { TvShowEditFormProps } from './types';

export function TvShowEditForm({ tvShow }: TvShowEditFormProps) {
  const editor = useTvEditor(tvShow);
  const { displayData, message, setMessage } = editor;
  const { handleTmdbImport } = useTmdbImport({ setPreviewData: editor.setPreviewData, setMessage });
  const { deletingSeasonNumber, handleDeleteSeason } = useDeleteSeason(tvShow?.id ?? null);

  return (
    <>
      <EditFormShell
        heading={tvShow ? `Edit "${displayData.name}"` : 'Create TV Show'}
        backHref="/admin/tv-shows"
        viewHref={tvShow?.slug ? `/tv-shows/${tvShow.slug}` : undefined}
        tabs={TV_TABS}
        activeTab={editor.activeTab}
        onTabChange={editor.setActiveTab}
        message={message}
        isSaving={editor.saveMutation.isPending}
        onSubmit={(formData) => {
          setMessage(null);
          if (!formData.get('is_featured')) formData.set('is_featured', '');
          editor.saveMutation.mutate(formData);
        }}
        contentKey={String(displayData.tmdb_id ?? displayData.id ?? 'new')}
      >
        <TabPanel isActive={editor.activeTab === 'primary_facts'}>
          <PrimaryFactsTab
            data={displayData}
            fields={TV_SHOW_FIELDS}
            isExistingRecord={Boolean(tvShow)}
            importSearchPlaceholder="Search for a TV show..."
            importSearchAction={(query) => searchTmdbAction(query, 'tv')}
            onImportTmdb={(tmdbId) => void handleTmdbImport(tmdbId)}
            onPosterSelect={editor.handlePosterSelect}
            onBackdropSelect={editor.handleBackdropSelect}
            onClearPoster={editor.handleClearPoster}
            onClearBackdrop={editor.handleClearBackdrop}
          />
        </TabPanel>
        <TabPanel isActive={editor.activeTab === 'seasons'}>
          <SeasonsTab
            tvShowId={tvShow?.id ?? null}
            seasons={displayData.seasons}
            deletingSeasonNumber={deletingSeasonNumber}
            onDeleteSeason={(seasonNumber) => void handleDeleteSeason(seasonNumber)}
          />
        </TabPanel>
        <TabPanel isActive={editor.activeTab === 'images'}>
          <ImagesTab
            images={displayData.images}
            posterPath={displayData.poster_path}
            backdropPath={displayData.backdrop_path}
            onPreview={editor.setPreviewImage}
            onDeleteImage={() => setMessage({ text: 'Image deletion is not implemented yet.', type: 'error' })}
            onPosterSelect={editor.handlePosterSelect}
            onBackdropSelect={editor.handleBackdropSelect}
          />
        </TabPanel>
        <TabPanel isActive={editor.activeTab === 'cast'}>
          <CastTab cast={displayData.cast} />
        </TabPanel>
        <TabPanel isActive={editor.activeTab === 'reviews' || editor.activeTab === 'comments'}>
          <UnderConstructionPanel label={TV_TABS.find((tab) => tab.id === editor.activeTab)?.label ?? ''} />
        </TabPanel>
      </EditFormShell>
      {editor.previewImage && (
        <ImagePreviewModal src={editor.previewImage} onClose={() => editor.setPreviewImage(null)} />
      )}
    </>
  );
}

export type { TvShowEditFormProps } from './types';
