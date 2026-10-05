import React from 'react';

interface HelpGuideModalProps {
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-2 border-amber-600/80 rounded-lg p-6 text-zinc-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗡️</span>
            <h3 className="font-pixel text-amber-400 text-sm">
              眾神的三角神力：地城探險與計分指南
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-pixel text-xs px-2 py-1 bg-zinc-800 rounded border border-zinc-700 cursor-pointer"
          >
            ✕ 關閉
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-xs text-zinc-300 leading-relaxed font-sans">
          {/* Controls table */}
          <div>
            <h4 className="font-pixel text-amber-300 text-[11px] mb-2 flex items-center gap-1.5">
              <span>🎮</span> 操作鍵位一覽
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">四向移動</span>
                <span className="text-amber-400 font-bold">WASD / 方向鍵</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">揮劍攻擊</span>
                <span className="text-amber-400 font-bold">J / 空白鍵 (Space)</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">放置炸彈</span>
                <span className="text-amber-400 font-bold">B / Q 鍵 (或點擊 💣)</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">搬壺 / 投擲 / 開箱</span>
                <span className="text-amber-400 font-bold">K / E 鍵</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">大迴旋斬 (Spin Attack)</span>
                <span className="text-amber-400 font-bold">長按 [J] 蓄力後放開</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">重新開始</span>
                <span className="text-amber-400 font-bold">R 鍵</span>
              </div>
            </div>
          </div>

          {/* Destructible Walls & Secret Rooms */}
          <div>
            <h4 className="font-pixel text-amber-300 text-[11px] mb-2 flex items-center gap-1.5">
              <span>💣</span> 可破壞石牆與隱藏密室
            </h4>
            <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
              <p>
                在石室與牢房中，留意石牆表面帶有<strong className="text-cyan-300">深色裂痕與微弱藍光氣流</strong>的特殊區域！
                使用炸彈引爆（或投擲重陶壺、施放滿蓄力迴旋斬）可將裂牆轟塌，揭示通往隱藏房間的入口：
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>
                  <strong className="text-cyan-300">大妖精神秘泉源 (西密室)：</strong>
                  位於機關重石室北牆。擁有清澈碧泉、回復生命的心之妖精、多個紅盧比陶壺與補給品。
                </li>
                <li>
                  <strong className="text-purple-300">古代皇家秘寶庫 (東密室)：</strong>
                  位於守衛牢房北牆。藏有珍貴的黃金寶箱，內含<strong className="text-red-400">【心之容器】</strong>，可將林克的生命上限永久提升至 4 顆心並完全治癒傷勢！
                </li>
              </ul>
            </div>
          </div>

          {/* Scoring System */}
          <div>
            <h4 className="font-pixel text-amber-300 text-[11px] mb-2 flex items-center gap-1.5">
              <span>🏆</span> 計分系統與評價階級 (Rank S ~ C)
            </h4>
            <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
              <p>每次探險將即時計算冒險得分，並記錄於最高分榜：</p>
              <div className="grid grid-cols-2 gap-2 text-zinc-400 text-[11px] font-mono">
                <div>• 擊敗一般魔物 / 蝙蝠：+100 / +50 分</div>
                <div>• 擊敗黑鐵騎士首領：+1000 分</div>
                <div>• 拾取綠/藍/紅盧比：+10 / +50 / +200 分</div>
                <div>• 炸毀裂縫石牆發現密室：+500 分/間</div>
                <div>• 解開地面重壓開關：+200 分</div>
                <div>• 開啟心之容器 / 密室寶箱：+600 / +500 分</div>
                <div>• 通關時間加成：最高 +3000 分 (隨秒數遞減)</div>
                <div>• 無傷通關獎勵 (Pristine Run)：+1000 分</div>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-3 font-pixel text-[10px]">
                <span className="text-amber-400">★ S 級：≥ 5,000 分</span>
                <span className="text-emerald-400">◆ A 級：≥ 3,500 分</span>
                <span className="text-sky-400">● B 級：≥ 2,000 分</span>
                <span className="text-zinc-500">○ C 級：&lt; 2,000 分</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-zinc-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold font-pixel text-xs rounded transition-colors cursor-pointer"
          >
            我知道了，前往探險！
          </button>
        </div>
      </div>
    </div>
  );
};
