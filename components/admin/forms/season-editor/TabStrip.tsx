'use client';

interface TabStripProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabStrip({ tabs, activeTab, onTabChange }: TabStripProps) {
  return (
    <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 overflow-x-auto lg:overflow-y-auto bg-transparent py-3 lg:py-6 shrink-0">
      <nav className="flex lg:flex-col px-4 gap-1.5" aria-label="Editor sections">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'true' : undefined}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg transition-colors duration-200 text-[13px] font-medium cursor-pointer focus-ring ${activeTab === tab.id
              ? 'bg-red-600/15 text-red-400'
              : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
