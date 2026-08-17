import { fetchApi } from '@/lib/api';

async function getAnalytics() {
  const [overviewRes, topTitlesRes, engagementRes] = await Promise.all([
    fetchApi('/admin/analytics/overview', { next: { revalidate: 0 } }),
    fetchApi('/admin/analytics/top-titles', { next: { revalidate: 0 } }),
    fetchApi('/admin/analytics/engagement', { next: { revalidate: 0 } })
  ]);
  
  const overview = overviewRes.ok ? (await overviewRes.json()).data : null;
  const topTitles = topTitlesRes.ok ? (await topTitlesRes.json()).data : null;
  const engagement = engagementRes.ok ? (await engagementRes.json()).data : null;
  
  return { overview, topTitles, engagement };
}

export default async function AdminDashboardPage() {
  const data = await getAnalytics();

  if (!data.overview || !data.topTitles || !data.engagement) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-red-500 font-medium">Failed to load analytics data.</p>
      </div>
    );
  }

  const { total_users, total_movies, total_tv_shows, total_watch_hours, top_countries } = data.overview;
  const { top_movies, top_episodes } = data.topTitles;
  const { chart_data } = data.engagement;

  const cardBase = "bg-[#0A0A0A] border border-white/5 rounded flex flex-col";

  // Calculate chart max for Y-axis scaling
  const maxWatches = Math.max(1, ...chart_data.map((d: any) => d.watches));
  const points = chart_data.map((d: any, idx: number) => {
    const x = (idx / (chart_data.length - 1)) * 1000;
    const y = 300 - ((d.watches / maxWatches) * 200); // Leaves 100px padding at top
    return `${x},${y}`;
  }).join(' ');

  // Get labels for X-axis (display 7 evenly spaced dates)
  const xLabels = [];
  const step = Math.max(1, Math.floor(chart_data.length / 6));
  for (let i = 0; i < chart_data.length; i += step) {
    xLabels.push(chart_data[i].date);
  }
  if (xLabels.length < 7 && chart_data.length > 0) {
     xLabels.push(chart_data[chart_data.length - 1].date);
  }

  return (
    <div className="animate-in fade-in duration-500 text-[#F8FAFC] font-sans">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-[1.3rem] font-medium text-white">Plays report</h1>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex bg-[#0A0A0A] rounded border border-white/5 p-0.5">
            <button className="px-5 py-1.5 text-red-500 bg-[#000000] rounded border border-white/5 shadow-sm">Plays</button>
            <button className="px-5 py-1.5 text-white/60 hover:text-white transition-colors">Visitors</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#0A0A0A] border border-white/5 rounded text-white/80 hover:bg-[#111111] transition-colors">
            Aug 16 – 22, 2026
            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className={`${cardBase} p-5`}>
          <h3 className="text-white/80 font-semibold text-xs mb-4">Total Users</h3>
          <div className="flex items-end gap-3">
            <p className="text-[28px] font-medium leading-none">{total_users.toLocaleString()}</p>
            <p className="text-xs font-semibold text-green-500 mb-1 flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> +12%</p>
          </div>
        </div>

        <div className={`${cardBase} p-5`}>
          <h3 className="text-white/80 font-semibold text-xs mb-4">Movies Catalog</h3>
          <div className="flex items-end gap-3">
            <p className="text-[28px] font-medium leading-none">{total_movies.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center">→ 0%</p>
          </div>
        </div>

        <div className={`${cardBase} p-5`}>
          <h3 className="text-white/80 font-semibold text-xs mb-4">TV Shows Catalog</h3>
          <div className="flex items-end gap-3">
            <p className="text-[28px] font-medium leading-none">{total_tv_shows.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center">→ 0%</p>
          </div>
        </div>

        <div className={`${cardBase} p-5`}>
          <h3 className="text-white/80 font-semibold text-xs mb-4">Watch Hours</h3>
          <div className="flex items-end gap-3">
            <p className="text-[28px] font-medium leading-none">{total_watch_hours.toLocaleString()}</p>
            <p className="text-xs font-semibold text-red-500 mb-1 flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> +5%</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Main Line Chart */}
        <div className={`${cardBase} lg:col-span-2 p-6 min-h-[400px]`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-semibold text-sm">Plays</h3>
            <span className="text-white/40 text-xs">{chart_data.reduce((acc: number, cur: any) => acc + cur.watches, 0).toLocaleString()} total plays (30 days)</span>
          </div>

          <div className="flex-1 relative w-full h-[280px]">
             {/* Y-Axis Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between z-0">
                {[1.0, 0.8, 0.6, 0.4, 0.2, 0.0].map((val, i) => (
                  <div key={i} className="flex items-center gap-4 w-full">
                    <span className="text-[10px] text-gray-500 w-6 text-right">{(val * maxWatches).toFixed(0)}</span>
                    <div className="flex-1 border-t border-white/5"></div>
                  </div>
                ))}
             </div>
             
             {/* The Data Line */}
             <div className="absolute inset-0 ml-10 z-10 py-1">
               <svg viewBox="0 0 1000 300" className="w-full h-[280px] overflow-visible" preserveAspectRatio="none">
                  {/* Fill Area */}
                  <defs>
                    <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon points={`0,300 ${points} 1000,300`} fill="url(#red-gradient)" />
                  {/* Line */}
                  <polyline points={points} fill="none" stroke="#DC2626" strokeWidth="3" />
                  {/* Points */}
                  {chart_data.map((d: any, idx: number) => {
                     const x = (idx / (chart_data.length - 1)) * 1000;
                     const y = 300 - ((d.watches / maxWatches) * 200);
                     return (
                        <circle key={idx} cx={x} cy={y} r="4" fill="#0A0A0A" stroke="#DC2626" strokeWidth="2" className="hover:r-6 hover:fill-red-500 transition-all cursor-pointer" />
                     );
                  })}
               </svg>
             </div>

             {/* X-Axis Labels */}
             <div className="flex justify-between ml-10 mt-4 text-[10px] text-gray-500 z-10 pt-2 border-t border-white/5 absolute bottom-0 w-[calc(100%-2.5rem)] translate-y-8">
               {xLabels.map((label, i) => (
                 <span key={i}>{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               ))}
             </div>
          </div>
        </div>

        {/* Top Devices / Regions Radar Chart */}
        <div className={`${cardBase} p-6 min-h-[400px]`}>
          <h3 className="text-white font-semibold text-sm mb-auto">Top regions</h3>

          <div className="flex-1 flex items-center justify-center py-6 relative">
            {/* Radar Chart concentric circles */}
            <div className="relative w-48 h-48 rounded-full border border-white/5 flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full border border-white/5" />
              <div className="absolute w-32 h-32 rounded-full border border-white/5" />
              <div className="absolute w-24 h-24 rounded-full border border-white/5" />
              <div className="absolute w-16 h-16 rounded-full border border-white/5" />
              <div className="absolute w-8 h-8 rounded-full border border-white/5" />

              {/* Values axis */}
              <div className="absolute top-0 bottom-1/2 w-4 bg-[#0A0A0A] flex flex-col items-center justify-between pb-1 text-[9px] text-gray-400 z-10">
                <span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span>
              </div>
            </div>
          </div>

          {/* Actual data below chart */}
          {top_countries && top_countries.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {top_countries.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-400">{item.country}</span>
                  <span className="text-white/90 font-semibold">{item.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Most played series */}
        <div className={`${cardBase} p-6 min-h-[250px]`}>
          <h3 className="text-white font-semibold text-sm mb-6">Most played series</h3>
          <div className="space-y-4">
            {top_episodes && top_episodes.length > 0 ? top_episodes.slice(0, 5).map((row: any, idx: number) => {
              const tvShow = row.watchable?.season?.tvShow;
              const title = tvShow?.name || 'Unknown Show';
              const poster = tvShow?.poster_path;
              return (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-black border border-white/5 overflow-hidden">
                       {poster && <img src={`https://image.tmdb.org/t/p/w200${poster}`} alt="poster" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="text-sm text-white/90 font-medium">{title}</h4>
                      <p className="text-[11px] text-gray-500">ID: {row.watchable_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-500">{row.views.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">views</span></p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px]">i</span>
                No plays in selected timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Most played movies */}
        <div className={`${cardBase} p-6 min-h-[250px]`}>
          <h3 className="text-white font-semibold text-sm mb-6">Most played movies</h3>
          <div className="space-y-4">
             {top_movies && top_movies.length > 0 ? top_movies.slice(0, 5).map((row: any, idx: number) => {
              return (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-black border border-white/5 overflow-hidden">
                       {row.watchable?.poster_path && <img src={`https://image.tmdb.org/t/p/w200${row.watchable.poster_path}`} alt="poster" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="text-sm text-white/90 font-medium">{row.watchable?.title || 'Unknown Movie'}</h4>
                      <p className="text-[11px] text-gray-500">ID: {row.watchable_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-500">{row.views.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">views</span></p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px]">i</span>
                No plays in selected timeframe.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
