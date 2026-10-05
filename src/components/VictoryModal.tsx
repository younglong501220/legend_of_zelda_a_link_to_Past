import React from 'react';
import { GameStats } from '../types/game';

interface VictoryModalProps {
  stats: GameStats;
  rupees: number;
  hp: number;
  maxHp: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  rupees,
  hp,
  maxHp,
  onRestart,
}) => {
  const timeTakenSec = Math.floor(
    ((stats.finishTime || Date.now()) - stats.startTime) / 1000
  );
  const minutes = Math.floor(timeTakenSec / 60);
  const seconds = timeTakenSec % 60;

  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  const getRankBadge = (rank?: string) => {
    switch (rank) {
      case 'S':
        return { text: 'RANK S · 海拉魯大勇者', color: 'from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border-amber-300' };
      case 'A':
        return { text: 'RANK A · 傳奇聖劍騎士', color: 'from-emerald-400 to-teal-500 text-zinc-950 border-emerald-300' };
      case 'B':
        return { text: 'RANK B · 勇敢冒險者', color: 'from-sky-400 to-blue-500 text-zinc-950 border-sky-300' };
      default:
        return { text: 'RANK C · 初心見習士官', color: 'from-zinc-400 to-zinc-600 text-zinc-950 border-zinc-400' };
    }
  };

  const rankBadge = getRankBadge(stats.rank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-zinc-900 border-4 border-amber-500 rounded-lg p-6 text-center text-zinc-100 font-pixel shadow-[0_0_50px_rgba(245,158,11,0.4)] relative overflow-hidden">
        {/* Decorative Golden Triforce Animation */}
        <div className="relative w-28 h-24 mx-auto mb-3 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-b-[62px] border-b-amber-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse" />
          <div className="absolute top-[26px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[31px] border-t-zinc-900" />
        </div>

        <h2 className="text-xl sm:text-2xl text-amber-400 font-bold tracking-wider mb-2 drop-shadow">
          TRIFORCE GET!
        </h2>

        {/* Rank Badge */}
        <div className="mb-4 flex items-center justify-center">
          <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${rankBadge.color} font-bold text-xs sm:text-sm border shadow-lg`}>
            {rankBadge.text}
          </div>
        </div>

        {/* Score Highlight Box */}
        <div className="bg-zinc-950 border-2 border-amber-500/70 rounded-lg p-3 mb-4 flex items-center justify-around">
          <div>
            <div className="text-[9px] text-amber-400/80 mb-0.5">FINAL SCORE</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 tabular-nums">
              {stats.score.toLocaleString()} PTS
            </div>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <div className="text-[9px] text-zinc-500 mb-0.5">BEST RECORD</div>
            <div className="text-sm font-bold text-zinc-300 tabular-nums">
              {stats.highScore.toLocaleString()} PTS
            </div>
            {isNewHighScore && (
              <span className="text-[8px] text-emerald-400 font-bold animate-pulse">
                ★ NEW RECORD!
              </span>
            )}
          </div>
        </div>

        {/* Quest Statistics Breakdown */}
        <div className="bg-zinc-950/80 border border-zinc-700 rounded-lg p-3.5 mb-5 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>⏱️</span> 通關耗時
            </span>
            <span className="text-amber-400 font-bold tabular-nums">
              {minutes}分 {seconds.toString().padStart(2, '0')}秒
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>🚪</span> 發現隱藏密室
            </span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {stats.secretRoomsFound} / 2 間
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>💎</span> 收集盧比
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {rupees} 顆
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>⚔️</span> 擊倒魔物
            </span>
            <span className="text-zinc-100 font-bold tabular-nums">
              {stats.enemiesDefeated} 隻
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>💣</span> 使用炸彈
            </span>
            <span className="text-amber-400 font-bold tabular-nums">
              {stats.bombsUsed} 顆
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span>❤️</span> 剩餘生命
            </span>
            <span className="text-red-400 font-bold tabular-nums">
              {Math.ceil(hp / 2)} / {Math.ceil(maxHp / 2)} 顆心
            </span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-zinc-950 font-bold text-sm tracking-wider rounded border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-transform active:scale-95 cursor-pointer"
        >
          重新開始挑戰高分 (R)
        </button>
      </div>
    </div>
  );
};
