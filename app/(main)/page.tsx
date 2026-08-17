import { fetchApi } from '@/lib/api';
import { PosterCard } from '@/components/ui/PosterCard';
import { DraggableList } from '@/components/ui/DraggableList';
import { HeroCarousel } from '@/components/ui/HeroCarousel';

async function getBrowseData() {
  const res = await fetchApi('/browse', { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data.rows;
}

export default async function BrowsePage() {
  const rows = await getBrowseData();

  if (!rows) {
    return <div className="p-8 text-center text-red-400">Failed to load browse data.</div>;
  }

  // Use the first 5 items of the "Featured" row as the hero carousel
  const featuredRow = rows.find((r: any) => r.title === 'Featured');
  const heroItems = featuredRow?.items?.slice(0, 5) || [];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <HeroCarousel items={heroItems} />

      {/* Content Rows */}
      <div className="w-full px-8 md:px-16 lg:px-24 space-y-12 relative z-20">
        {rows.map((row: any, idx: number) => {
          if (!row.items || row.items.length === 0) return null;
          return (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-white mb-4">{row.title}</h2>
              <DraggableList className="pb-4" innerClassName="space-x-4">
                {row.items.map((item: any, itemIdx: number) => (
                  <div key={`${item.id}-${itemIdx}`} className="snap-start shrink-0">
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
