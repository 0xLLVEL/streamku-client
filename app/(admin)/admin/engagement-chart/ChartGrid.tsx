import type { ChartTick } from './types';

export function ChartGrid({ ticks }: { ticks: ChartTick[] }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between z-0">
      {ticks.map((tick) => (
        <div key={tick.fraction} className="flex items-center gap-4 w-full">
          <span className="text-[10px] text-white/40 w-7 text-right tabular-nums">{tick.label}</span>
          <div className="flex-1 border-t border-white/5" />
        </div>
      ))}
    </div>
  );
}
