import React, { useState } from 'react';
import { audioEngine } from '../audio/soundEngine';

interface AudioSettingsBarProps {
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onOpenHelp: () => void;
}

export const AudioSettingsBar: React.FC<AudioSettingsBarProps> = ({
  crtEnabled,
  onToggleCrt,
  onOpenHelp,
}) => {
  const [isMuted, setIsMuted] = useState(audioEngine.getMuted());
  const [bgmActive, setBgmActive] = useState(audioEngine.isBGMPlaying());
  const [volume, setVolume] = useState(audioEngine.getVolume());

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    audioEngine.setMute(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleToggleBgm = () => {
    const nextBgm = audioEngine.toggleBGM();
    setBgmActive(nextBgm);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      audioEngine.setMute(false);
      setIsMuted(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg">
      {/* Left: Audio Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* SFX Mute/Unmute */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-red-950/60 border-red-800 text-red-300'
              : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 text-zinc-200'
          }`}
          title="靜音切換 (Mute/Unmute SFX)"
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span className="font-pixel text-[10px]">{isMuted ? '靜音' : '音效開啟'}</span>
        </button>

        {/* 16-bit Dungeon Synth BGM Toggle */}
        <button
          type="button"
          onClick={handleToggleBgm}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            bgmActive
              ? 'bg-amber-950/60 border-amber-700 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 text-zinc-400'
          }`}
          title="切換 16-bit 地城合成器背景音樂 (Procedural Synth BGM)"
        >
          <span>🎵</span>
          <span className="font-pixel text-[10px]">
            {bgmActive ? '地城BGM：播放中' : '地城BGM：關閉'}
          </span>
        </button>

        {/* Volume slider */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-amber-500 cursor-pointer"
            aria-label="音量大小調整"
          />
        </div>
      </div>

      {/* Right: CRT Filter & Game Guide */}
      <div className="flex items-center gap-3">
        {/* CRT Scanline Filter Toggle */}
        <button
          type="button"
          onClick={onToggleCrt}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            crtEnabled
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 text-zinc-400'
          }`}
          title="開啟或關閉 90年代復古 CRT 掃描線濾鏡"
        >
          <span>📺</span>
          <span className="font-pixel text-[10px]">{crtEnabled ? 'CRT 濾鏡 ON' : 'CRT 濾鏡 OFF'}</span>
        </button>

        {/* Guide / Lore Modal */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-pixel text-[10px] transition-colors cursor-pointer"
        >
          <span>📜</span>
          <span>遊戲指南</span>
        </button>
      </div>
    </div>
  );
};
