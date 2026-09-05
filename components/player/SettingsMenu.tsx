'use client';

import { SPEEDS } from './constants';
import type { SubtitleTrack } from './types';

interface SettingsMenuProps {
  open: boolean;
  playbackRate: number;
  subsOn: boolean;
  subtitles: SubtitleTrack[];
  activeSubLang: string;
  onSpeed: (rate: number) => void;
  onToggleSubs: () => void;
  onPickLang: (lang: string) => void;
}

export function SettingsMenu({ open, playbackRate, subsOn, subtitles, activeSubLang, onSpeed, onToggleSubs, onPickLang }: SettingsMenuProps) {
  return (
    <div className={`vp-settings-popover ${open ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="px-[18px] py-2 text-[13px] font-semibold text-white/40">Speed</div>
      <div className="vp-speed-options">
        {SPEEDS.map((r) => (
          <button key={r} className={`vp-speed-option ${playbackRate === r ? 'active' : ''}`} onClick={() => onSpeed(r)}>{r}x</button>
        ))}
      </div>
      <div className="divider" />
      <button className="option" onClick={onToggleSubs}><span>Subtitles</span><span className={`label ${subsOn ? 'active' : ''}`}>{subsOn ? 'On' : 'Off'}</span></button>
      {subtitles.length > 0 && (
        <div className="vp-speed-options">
          {subtitles.map((s) => (
            <button key={s.lang} className={`vp-speed-option ${subsOn && activeSubLang === s.lang ? 'active' : ''}`} onClick={() => onPickLang(s.lang)}>{s.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
