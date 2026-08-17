import { fetchApi } from '@/lib/api';
import Link from 'next/link';

async function getAnalytics() {
  const res = await fetchApi('/admin/analytics/overview', { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function AdminDashboardPage() {
  const data = await getAnalytics();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-red-500 font-medium">Failed to load analytics data. Ensure you are logged in as an Admin.</p>
      </div>
    );
  }

  const { total_users, total_movies, total_tv_shows, total_watch_hours, top_countries } = data;

  return (
    <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-normal text-white/90">Plays report</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex bg-[#111] rounded-lg p-1 border border-white/5">
            <button className="px-4 py-1.5 text-red-500 font-medium bg-black/40 backdrop-blur-md rounded-md shadow-sm border border-white/5">Plays</button>
            <button className="px-4 py-1.5 text-white/60 hover:text-white font-medium">Visitors</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 liquid-glass rounded-lg text-white/80 hover:bg-white/5 transition-colors">
            Aug 16 – 22, 2026
            <span className="opacity-50">📅</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row - Tightly packed */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="liquid-glass rounded-xl p-5 shadow-sm">
          <h3 className="text-white/60 font-medium text-xs mb-3">Total users</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-light text-white leading-none">{total_users.toLocaleString()}</p>
            <p className="text-xs font-bold text-green-500 flex items-center gap-1 leading-relaxed"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M17 7H7M17 7V17"></path></svg> +12%</p>
          </div>
        </div>
        
        <div className="liquid-glass rounded-xl p-5 shadow-sm">
          <h3 className="text-white/60 font-medium text-xs mb-3">Movies Catalog</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-light text-white leading-none">{total_movies.toLocaleString()}</p>
            <p className="text-xs font-bold text-white/30 flex items-center gap-1 leading-relaxed"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> 0%</p>
          </div>
        </div>

        <div className="liquid-glass rounded-xl p-5 shadow-sm">
          <h3 className="text-white/60 font-medium text-xs mb-3">TV Shows Catalog</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-light text-white leading-none">{total_tv_shows.toLocaleString()}</p>
            <p className="text-xs font-bold text-white/30 flex items-center gap-1 leading-relaxed"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> 0%</p>
          </div>
        </div>

        <div className="liquid-glass rounded-xl p-5 shadow-sm">
          <h3 className="text-white/60 font-medium text-xs mb-3">Watch hours</h3>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-light text-white leading-none">{total_watch_hours.toLocaleString()}</p>
            <p className="text-xs font-bold text-red-500 flex items-center gap-1 leading-relaxed"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7l10 10M17 17H7M17 17V7"></path></svg> -5%</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        
        {/* Main Line Chart */}
        <div className="lg:col-span-2 liquid-glass rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white/80 font-medium text-sm">Plays</h3>
            <span className="text-white/40 text-xs">0 total plays</span>
          </div>
          
          {/* Mock Line Chart */}
          <div className="flex-1 relative flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[1.0, 0.8, 0.6, 0.4, 0.2, 0.0, -0.2, -0.4, -0.6, -0.8, -1.0].map((val, i) => (
                <div key={i} className="flex items-center gap-4 w-full">
                  <span className="text-[10px] text-white/30 w-6 text-right">{val.toFixed(1)}</span>
                  <div className="flex-1 border-t border-white/5"></div>
                </div>
              ))}
            </div>
            
            {/* The line (flat at 0) */}
            <div className="absolute top-1/2 left-10 right-0 h-px bg-red-600 flex items-center justify-between z-10">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-red-600 outline outline-2 outline-[#111]" />
              ))}
            </div>
            
            <div className="flex justify-between ml-10 mt-4 text-[10px] text-white/30 z-10 pt-2 border-t border-white/10">
              <span>16 Sun</span>
              <span>17 Mon</span>
              <span>18 Tue</span>
              <span>19 Wed</span>
              <span>20 Thu</span>
              <span>21 Fri</span>
              <span>22 Sat</span>
            </div>
          </div>
        </div>

        {/* Top Devices Radar Chart */}
        <div className="liquid-glass rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-white/80 font-medium text-sm mb-auto">Top regions</h3>
          
          <div className="flex-1 flex items-center justify-center py-8">
             {/* Mock Radar Chart concentric circles */}
             <div className="relative w-48 h-48 rounded-full border border-white/5 flex items-center justify-center">
               <div className="absolute w-36 h-36 rounded-full border border-white/5" />
               <div className="absolute w-24 h-24 rounded-full border border-white/5" />
               <div className="absolute w-12 h-12 rounded-full border border-white/5" />
               
               {/* Values axis */}
               <div className="absolute top-0 bottom-1/2 w-px bg-white/5 flex flex-col items-center justify-between pb-2 text-[8px] text-white/40">
                  <span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span>
               </div>
             </div>
          </div>
          
          {/* Fallback to actual data */}
          {top_countries && top_countries.length > 0 && (
            <div className="mt-4 space-y-2">
               {top_countries.map((item: any, idx: number) => (
                 <div key={idx} className="flex justify-between text-xs">
                   <span className="text-white/60">{item.country}</span>
                   <span className="text-white/90">{item.views}</span>
                 </div>
               ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="liquid-glass rounded-xl p-6 shadow-sm min-h-[200px]">
          <h3 className="text-white/80 font-medium text-sm mb-6">Most played series</h3>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
            No plays in selected timeframe.
          </div>
        </div>

        <div className="liquid-glass rounded-xl p-6 shadow-sm min-h-[200px]">
          <h3 className="text-white/80 font-medium text-sm mb-6">Most played movies</h3>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
            No plays in selected timeframe.
          </div>
        </div>
      </div>

    </div>
  );
}
