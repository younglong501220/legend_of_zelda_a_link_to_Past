import React from 'react';
import { Player, RoomData } from '../types/game';

interface RetroHUDProps {
  player: Player;
  room: RoomData;
  curRoomKey: string;
  rooms: Record<string, RoomData>;
  highScore: number;
}

export const RetroHUD: React.FC<RetroHUDProps> = ({ player, room, curRoomKey, highScore }) => {
  const heartContainers = Math.ceil(player.maxHp / 2);
  const [curX, curY] = curRoomKey.split(',').map(Number);

  return (
    <div className="w-full bg-zinc-950 border-b-2 border-amber-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-pixel text-xs text-zinc-100 select-none">
      {/* Zone 1: Hearts Life Meter & Score */}
      <div className="flex items-center gap-4">
        {/* Hearts Life Meter */}
        <div className="flex flex-col">
          <span className="text-[10px] text-red-400 font-bold tracking-wider mb-1">
            - LIFE -
          </span>
          <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
            {Array.from({ length: heartContainers }).map((_, idx) => {
              const heartValue = player.hp - idx * 2;
              if (heartValue >= 2) {
                return (
                  <div
                    key={idx}
                    className="relative w-4 h-4 flex items-center justify-center animate-pulse"
                    style={{ animationDuration: player.hp <= 2 ? '0.5s' : '2s' }}
                    title="生命心之容器 (全滿)"
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-red-600 drop-shadow-[0_0_4px_rgba(220,38,38,0.8)]">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="absolute top-0.5 left-1 w-1 h-1 bg-white/70 rounded-full" />
                  </div>
                );
              } else if (heartValue === 1) {
                return (
                  <div key={idx} className="relative w-4 h-4" title="生命心之容器 (半心)">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-zinc-800">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-600">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="w-4 h-4" title="空心之容器">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-zinc-800 stroke-zinc-600 stroke-[1.5]">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Real-time Score Display */}
        <div className="flex flex-col bg-zinc-900/90 border border-amber-900/40 px-2.5 py-1 rounded shadow-inner">
          <span className="text-[8px] text-amber-500 font-bold tracking-wider">
            SCORE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300 font-bold text-sm tabular-nums">
              {player.score.toString().padStart(5, '0')}
            </span>
            {highScore > 0 && (
              <span className="text-[8px] text-zinc-500 hidden sm:inline tabular-nums" title="歷史最高紀錄">
                HI {highScore.toString().padStart(5, '0')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2: Rupee, Bomb & Key Inventory */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Rupees Counter */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 border border-zinc-800 rounded">
          <div className="w-3.5 h-4.5 bg-emerald-500 clip-hexagon shadow-[0_0_6px_rgba(16,185,129,0.5)] border border-emerald-300 rotate-12" />
          <span className="text-emerald-400 font-bold tabular-nums">
            {player.rupees.toString().padStart(3, '0')}
          </span>
        </div>

        {/* Bombs Counter */}
        <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-1 border border-zinc-800 rounded" title="炸彈庫存 (按 B 放置)">
          <span className="text-sm">💣</span>
          <span className={`font-bold tabular-nums ${player.bombs > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
            x{player.bombs}
          </span>
        </div>

        {/* Keys Counter */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 border border-zinc-800 rounded">
          <span className="text-amber-400 text-sm">🗝️</span>
          <span className="text-amber-300 font-bold tabular-nums">
            x{player.keys}
          </span>
        </div>
      </div>

      {/* Zone 3: Mini-Map & Room Name */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-amber-400 text-[11px] font-bold truncate max-w-[140px]">
            {room.name}
          </div>
          <div className="text-[8px] text-zinc-500 tracking-wider">
            {room.subtitle}
          </div>
        </div>

        {/* 2D Mini-Map (6 Rooms Grid with Secret Rooms) */}
        <div className="bg-zinc-900 border border-zinc-700 p-1 rounded grid grid-cols-3 gap-0.5 w-16 h-12 shadow-inner">
          {/* Top row: (-1,-1 Fairy Spring, 0,-1 Boss Sanctum, 1,-1 Royal Crypt) */}
          <div
            className={`border rounded-xs transition-colors ${
              curX === -1 && curY === -1
                ? 'bg-cyan-400 border-cyan-300 animate-pulse'
                : 'bg-zinc-800/60 border-zinc-800'
            }`}
            title="大妖精神秘泉源 (密室)"
          />
          <div
            className={`border rounded-xs transition-colors ${
              curX === 0 && curY === -1
                ? 'bg-amber-400 border-amber-300 animate-pulse'
                : 'bg-zinc-800 border-zinc-700'
            }`}
            title="三角神力聖堂 (北)"
          />
          <div
            className={`border rounded-xs transition-colors ${
              curX === 1 && curY === -1
                ? 'bg-purple-400 border-purple-300 animate-pulse'
                : 'bg-zinc-800/60 border-zinc-800'
            }`}
            title="古代皇家秘寶庫 (密室)"
          />

          {/* Bottom row: (-1,0 Stone puzzle, 0,0 Entrance, 1,0 Guard cell) */}
          <div
            className={`border rounded-xs transition-colors ${
              curX === -1 && curY === 0
                ? 'bg-emerald-400 border-emerald-300 animate-pulse'
                : 'bg-zinc-800 border-zinc-700'
            }`}
            title="機關石室 (西)"
          />
          <div
            className={`border rounded-xs transition-colors ${
              curX === 0 && curY === 0
                ? 'bg-emerald-400 border-emerald-300 animate-pulse'
                : 'bg-zinc-800 border-zinc-700'
            }`}
            title="地城入口 (中央)"
          />
          <div
            className={`border rounded-xs transition-colors ${
              curX === 1 && curY === 0
                ? 'bg-emerald-400 border-emerald-300 animate-pulse'
                : 'bg-zinc-800 border-zinc-700'
            }`}
            title="守衛牢房 (東)"
          />
        </div>
      </div>
    </div>
  );
};
