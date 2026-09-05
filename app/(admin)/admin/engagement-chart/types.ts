export interface EngagementPoint {
  date: string;
  watches: number;
}

export type RangeDays = 7 | 30;

export interface ChartCoord extends EngagementPoint {
  x: number;
  y: number;
}

export interface ChartTick {
  label: string;
  fraction: number;
}
