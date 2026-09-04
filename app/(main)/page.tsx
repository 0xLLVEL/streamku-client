import { fetchApi } from '@/lib/api';
import { PosterCard } from '@/components/media/PosterCard';
import { DraggableList } from '@/components/media/DraggableList';
import { HeroCarousel } from '@/components/media/HeroCarousel';
import { ContinueWatchingRow } from '@/components/media/ContinueWatchingRow';
import { BrowseRow } from '@/types';

async function getHistoryData() {
  try {
    const res = await fetchApi('/history/continue-watching', { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data;
  } catch {
    return [];
  }
}

async function getBrowseData(): Promise<BrowseRow[] | null> {
  const res = await fetchApi('/browse', { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data.rows;
}

export default async function BrowsePage() {
  const [rows, history] = await Promise.all([
    getBrowseData(),
    getHistoryData()
  ]);

  if (!rows) {
    return <div className="p-8 text-center text-red-400">Failed to load browse data.</div>;
  }

  // Use the first 5 items of the "Featured" row as the hero carousel
  const featuredRow = rows.find((r) => r.title === 'Featured');
  const heroItems = featuredRow?.items?.slice(0, 5) || [];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <HeroCarousel items={heroItems} />

      {/* Content Rows */}
      <div className="w-full px-4 md:px-12 lg:px-24 space-y-12 relative z-20">
        <ContinueWatchingRow items={history} />
        {rows.filter((row) => row.title !== 'Featured').map((row, idx) => {
          if (!row.items || row.items.length === 0) return null;
          return (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-foreground mb-4">{row.title}</h2>
              <DraggableList className="pb-4" innerClassName="space-x-4">
                {row.items.map((item, itemIdx) => (
                  <div key={`${item.id}-${itemIdx}`} className="snap-start shrink-0 w-[140px] md:w-[180px]">
                    <PosterCard item={item} priority={idx === 0} />
                  </div>
                ))}
              </DraggableList>
            </div>
          );
        })}
      </div>
    </div>
  );
}
