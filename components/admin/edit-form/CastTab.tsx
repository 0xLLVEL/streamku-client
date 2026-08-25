'use client';

import type { TmdbCastMember } from './types';

interface CastTabProps {
  cast: TmdbCastMember[] | null | undefined;
}

/** Read-only cast grid with a placeholder "add member" action. */
export function CastTab({ cast }: CastTabProps) {
  const members = cast ?? [];
  return (
    <div className="max-w-6xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Cast ({members.length})</h2>
        <button
          type="button"
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
        >
          Add Cast Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-xl border border-white/5 bg-[#050505] overflow-hidden">
        {members.map((person) => (
          <div
            key={person.id}
            className="flex items-center gap-3 py-2.5 px-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 border-r border-white/5 group"
          >
            <div className="w-9 h-9 shrink-0 bg-[#1e1e24] rounded-full overflow-hidden">
              {person.profile_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  className="w-full h-full object-cover"
                  alt={person.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px]">
                  N/A
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[13px] text-white truncate" title={person.name}>
                {person.name}
              </p>
              <p className="text-white/40 text-[11px] truncate mt-0.5" title={person.character ?? undefined}>
                {person.character}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
              <button type="button" className="text-white/30 hover:text-red-400 p-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full p-8 text-center text-white/50 text-sm">No cast available.</div>
        )}
      </div>
    </div>
  );
}

/** Shared "under construction" body for Reviews / Comments tabs. */
export function UnderConstructionPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white/30 animate-in fade-in duration-300">
      <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h2 className="text-xl font-medium mb-2">{label} Manager</h2>
      <p className="text-sm text-center max-w-sm">
        This section is currently under construction. You will be able to manage{' '}
        {label.toLowerCase()} here in a future update.
      </p>
    </div>
  );
}
