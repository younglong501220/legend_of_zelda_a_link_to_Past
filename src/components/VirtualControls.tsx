import React from 'react';
import { GameInputState } from '../game/gameEngine';

interface VirtualControlsProps {
  inputState: GameInputState;
  onButtonDown: (button: 'up' | 'down' | 'left' | 'right' | 'attack' | 'interact') => void;
  onButtonUp: (button: 'up' | 'down' | 'left' | 'right' | 'attack' | 'interact') => void;
  onBombPress: () => void;
  onReset: () => void;
  bombsCount: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  inputState,
  onButtonDown,
  onButtonUp,
  onBombPress,
  onReset,
  bombsCount,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 select-none touch-none">
      {/* Directional Pad (D-Pad) */}
      <div className="relative w-36 h-36 bg-zinc-900/90 rounded-full border-2 border-zinc-700 p-2 shadow-lg flex items-center justify-center">
        <div className="relative w-28 h-28">
          {/* UP */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('up'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('up'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('up'); }}
            className={`absolute top-0 left-9 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-t border-t border-zinc-500 flex items-center justify-center text-zinc-300 font-pixel text-xs transition-colors shadow ${
              inputState.up ? 'bg-amber-600/80 text-white' : ''
            }`}
            aria-label="向上移動"
          >
            ▲
          </button>

          {/* DOWN */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('down'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('down'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('down'); }}
            className={`absolute bottom-0 left-9 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-b border-b border-zinc-500 flex items-center justify-center text-zinc-300 font-pixel text-xs transition-colors shadow ${
              inputState.down ? 'bg-amber-600/80 text-white' : ''
            }`}
            aria-label="向下移動"
          >
            ▼
          </button>

          {/* LEFT */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('left'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('left'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('left'); }}
            className={`absolute top-9 left-0 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-l border-l border-zinc-500 flex items-center justify-center text-zinc-300 font-pixel text-xs transition-colors shadow ${
              inputState.left ? 'bg-amber-600/80 text-white' : ''
            }`}
            aria-label="向左移動"
          >
            ◀
          </button>

          {/* RIGHT */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('right'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('right'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('right'); }}
            className={`absolute top-9 right-0 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-r border-r border-zinc-500 flex items-center justify-center text-zinc-300 font-pixel text-xs transition-colors shadow ${
              inputState.right ? 'bg-amber-600/80 text-white' : ''
            }`}
            aria-label="向右移動"
          >
            ▶
          </button>

          {/* Center Hub */}
          <div className="absolute top-9 left-9 w-10 h-10 bg-zinc-900 border border-zinc-800" />
        </div>
      </div>

      {/* Middle Controls (Restart & Hints) */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 rounded border border-zinc-600 font-pixel text-[10px] tracking-wider transition-colors shadow flex items-center gap-1.5 cursor-pointer"
        >
          <span>↺</span>
          <span>RESTART (R)</span>
        </button>
        <span className="text-[9px] text-zinc-500 font-pixel text-center hidden md:inline">
          長按 [A] 迴旋斬 ｜ [B] 放置炸彈
        </span>
      </div>

      {/* Action Buttons: [BOMB], [B: INTERACT], [A: SWORD] */}
      <div className="flex items-center gap-3">
        {/* Bomb Action Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onBombPress(); }}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-2 border-slate-500/80 shadow-lg text-white font-pixel text-xs flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer relative"
            aria-label="放置炸彈按鈕"
          >
            <span>💣</span>
            <span className="text-[7px] text-amber-300">x{bombsCount}</span>
          </button>
          <span className="text-[8px] text-zinc-400 font-pixel">B / Q</span>
        </div>

        {/* Action Button B: Lift / Throw / Interact */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('interact'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('interact'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('interact'); }}
            className={`w-13 h-13 rounded-full bg-amber-700 hover:bg-amber-600 active:bg-amber-500 border-2 border-amber-500/80 shadow-lg text-white font-pixel text-sm flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer ${
              inputState.interact ? 'ring-4 ring-amber-400 scale-95' : ''
            }`}
            aria-label="搬起/投擲/互動按鈕 (Y)"
          >
            <span>Y</span>
            <span className="text-[8px] opacity-80">搬壺</span>
          </button>
          <span className="text-[8px] text-zinc-400 font-pixel">K / E</span>
        </div>

        {/* Action Button A: Sword Slash / Spin Attack */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onButtonDown('attack'); }}
            onPointerUp={(e) => { e.preventDefault(); onButtonUp('attack'); }}
            onPointerLeave={(e) => { e.preventDefault(); onButtonUp('attack'); }}
            className={`w-15 h-15 rounded-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500 border-2 border-emerald-400/80 shadow-lg text-white font-pixel text-base flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer ${
              inputState.attack ? 'ring-4 ring-emerald-400 scale-95' : ''
            }`}
            aria-label="揮劍攻擊按鈕 (A)"
          >
            <span>A</span>
            <span className="text-[8px] opacity-80">揮劍</span>
          </button>
          <span className="text-[8px] text-zinc-400 font-pixel">J / 空白</span>
        </div>
      </div>
    </div>
  );
};
