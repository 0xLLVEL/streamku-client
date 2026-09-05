export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export const IDLE_HIDE_MS = 2000;
export const SYNC_INTERVAL_MS = 5000;
export const SEEK_SECONDS = 10;

// ponytail: player CSS in one place so index.tsx stays under budget.
export const PLAYER_STYLES = `
  .vp-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.15s; flex-shrink: 0; color: white; }
  .vp-btn:hover { background: rgba(255,255,255,0.12); }
  .vp-btn svg { width: 24px; height: 24px; }
  .vp-play-main { width: 52px; height: 52px; background: #e50914; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; color: white; }
  .vp-play-main:hover { background: #f40612; }
  .vp-play-main svg { width: 28px; height: 28px; }
  .vp-ep-btn { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; transition: background 0.15s, border-color 0.15s; color: white; cursor: pointer; }
  .vp-ep-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
  .vp-ep-btn .ep-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
  .vp-ep-btn .ep-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); }
  .vp-ep-btn .ep-name { font-size: 15px; font-weight: 600; color: #fff; }
  .vp-ep-btn svg { width: 22px; height: 22px; flex-shrink: 0; color: rgba(255,255,255,0.5); }
  .vp-speed-badge { font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 7px; background: rgba(255,255,255,0.1); transition: background 0.15s; letter-spacing: 0.02em; color: white; cursor: pointer; }
  .vp-speed-badge:hover { background: rgba(255,255,255,0.2); }
  .vp-settings-popover { position: absolute; bottom: 100%; right: 0; margin-bottom: 12px; background: rgba(18,18,18,0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px 0; min-width: 210px; opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity 0.2s, transform 0.2s; z-index: 50; }
  .vp-settings-popover.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .vp-settings-popover .option { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; font-size: 15px; color: rgba(255,255,255,0.7); transition: background 0.1s; width: 100%; text-align: left; cursor: pointer; background: none; border: none; }
  .vp-settings-popover .option:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .vp-settings-popover .option .label { color: rgba(255,255,255,0.4); font-size: 13px; }
  .vp-settings-popover .option .active { color: #e50914; font-weight: 600; }
  .vp-settings-popover .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
  .vp-speed-options { display: flex; flex-wrap: wrap; gap: 5px; padding: 6px 18px 10px; }
  .vp-speed-option { padding: 5px 12px; border-radius: 7px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); transition: background 0.1s, color 0.1s; cursor: pointer; background: none; border: none; }
  .vp-speed-option:hover { background: rgba(255,255,255,0.08); color: white; }
  .vp-speed-option.active { background: rgba(229,9,20,0.2); color: #e50914; }
  .vp-vol-wrap { width: 0; overflow: hidden; transition: width 0.2s ease; display: flex; align-items: center; padding-left: 0; }
  .vp-vol-group:hover .vp-vol-wrap { width: 120px; padding-left: 8px; }
`;
