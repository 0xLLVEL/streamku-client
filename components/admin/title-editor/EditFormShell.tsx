'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { EditFormShellProps } from './types';

/**
 * Layout for title edit forms: sticky header (back / heading / message / save),
 * tab sidebar, and scrollable content area.
 *
 * Tab panels stay mounted and toggle visibility via CSS so uncontrolled input
 * state survives switching tabs.
 */
export function EditFormShell({
  heading,
  backHref,
  viewHref,
  tabs,
  activeTab,
  onTabChange,
  message,
  isSaving,
  onSubmit,
  contentKey,
  children,
}: EditFormShellProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
      className="flex flex-col h-[100vh] -m-6 md:-m-8 overflow-hidden relative"
    >
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="text-white/40 hover:text-white transition-colors">
            <BackIcon />
          </Link>
          <h1 className="text-2xl font-medium text-white tracking-tight">{heading}</h1>
          {viewHref && (
            <a
              href={viewHref}
              target="_blank"
              rel="noreferrer"
              className="text-white/30 hover:text-white transition-colors ml-2"
              title="View on site"
            >
              <ExternalLinkIcon />
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          {message && (
            <span
              className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
              role="status"
            >
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded font-medium text-sm transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 border-r border-white/10 overflow-y-auto bg-transparent py-6 flex flex-col px-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`text-left px-4 py-2 rounded-md transition-colors duration-150 text-[13px] font-medium ${
                activeTab === tab.id
                  ? 'bg-red-500/10 text-red-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div key={contentKey} className="flex-1 overflow-y-auto p-8 bg-transparent">
          {children}
        </div>
      </div>
    </form>
  );
}

/** Wrapper that toggles a mounted panel without destroying its state. */
export function TabPanel({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) {
  return <div className={isActive ? 'block' : 'hidden'}>{children}</div>;
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
