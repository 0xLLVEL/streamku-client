'use client';

import { searchTmdbAction } from '@/app/actions/admin-content-media';
import { EditFormShell, TabPanel } from '../EditFormShell';
import { PrimaryFactsTab } from '../PrimaryFactsTab';
import { ImagesTab } from '../ImagesTab';
import { StreamsTab } from '../StreamsTab';
import { CastTab, UnderConstructionPanel } from '../CastTab';
import { ImagePreviewModal } from '../ImagePreviewModal';
import { MOVIE_FIELDS, MOVIE_TABS } from './constants';
import { useMovieEditor } from './hooks/use-movie-editor';
import { useTmdbImport } from './hooks/use-tmdb-import';
import { useDeleteStream } from './hooks/use-delete-stream';
import type { MovieEditFormProps } from './types';

export function MovieEditForm({ movie }: MovieEditFormProps) {
  const editor = useMovieEditor(movie);
  const { displayData, message, setMessage } = editor;
  const { handleTmdbImport } = useTmdbImport({ setPreviewData: editor.setPreviewData, setMessage });
  const { handleDeleteEmbedVideo } = useDeleteStream(movie?.id ?? null, setMessage);

  return (
    <>
      <EditFormShell
        heading={movie ? `Edit "${displayData.title}"` : 'Create Movie'}
        backHref="/admin/movies"
        viewHref={movie?.slug ? `/movies/${movie.slug}` : undefined}
        tabs={MOVIE_TABS}
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
            fields={MOVIE_FIELDS}
            isExistingRecord={Boolean(movie)}
            importSearchPlaceholder="Search for a movie..."
            importSearchAction={(query) => searchTmdbAction(query, 'movie')}
            onImportTmdb={(tmdbId) => void handleTmdbImport(tmdbId)}
            onPosterSelect={editor.handlePosterSelect}
            onBackdropSelect={editor.handleBackdropSelect}
            onClearPoster={editor.handleClearPoster}
            onClearBackdrop={editor.handleClearBackdrop}
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
        <TabPanel isActive={editor.activeTab === 'videos'}>
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
        <TabPanel isActive={editor.activeTab === 'cast'}>
          <CastTab cast={displayData.cast} />
        </TabPanel>
        <TabPanel isActive={editor.activeTab === 'reviews' || editor.activeTab === 'comments'}>
          <UnderConstructionPanel label={MOVIE_TABS.find((tab) => tab.id === editor.activeTab)?.label ?? ''} />
        </TabPanel>
      </EditFormShell>
      {editor.previewImage && (
        <ImagePreviewModal src={editor.previewImage} onClose={() => editor.setPreviewImage(null)} />
      )}
    </>
  );
}

export type { MovieEditFormProps } from './types';
