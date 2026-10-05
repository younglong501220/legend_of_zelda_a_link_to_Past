import React from 'react';

interface GameOverModalProps {
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border-4 border-red-700 rounded-lg p-6 text-center text-zinc-100 font-pixel shadow-[0_0_40px_rgba(220,38,38,0.5)]">
        <div className="text-4xl mb-4 animate-bounce">💔</div>
        <h2 className="text-2xl text-red-500 font-bold tracking-widest mb-3">
          GAME OVER
        </h2>
        <p className="text-sm text-zinc-300 font-sans mb-6">
          林克在探索地城的途中力竭倒下了... 但海拉魯的希望仍在！
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-6 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold text-xs tracking-wider rounded border border-red-500 shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          重生地城起點 (按 R 鍵)
        </button>
      </div>
    </div>
  );
};
