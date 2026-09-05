'use client';

import { useState } from 'react';
import { SEASON_TABS } from './constants';
import { useSeasonSave } from './hooks/use-season-save';
import { SeasonHeader } from './SeasonHeader';
import { TabStrip } from './TabStrip';
import { OverviewTab } from './OverviewTab';
import { EpisodesTab } from './EpisodesTab';
import type { SeasonEditFormProps } from './types';

export function SeasonEditForm({ tvShowId, season }: SeasonEditFormProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isSaving, message, handleSubmit } = useSeasonSave(tvShowId, season.season_number);
  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col h-[100vh] -m-4 sm:-m-6 lg:-m-8 overflow-hidden relative">
      <SeasonHeader title={season.name ?? ''} backHref={`/admin/tv-shows/${tvShowId}`} message={message} isSaving={isSaving} />
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <TabStrip tabs={SEASON_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent min-w-0">
          {activeTab === 'overview' && <OverviewTab season={season} />}
          {activeTab === 'episodes' && <EpisodesTab tvShowId={tvShowId} season={season} />}
        </div>
      </div>
    </form>
  );
}

export type { SeasonEditData, SeasonEditEpisode } from './types';
