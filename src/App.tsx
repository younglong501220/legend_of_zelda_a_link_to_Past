/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HelpGuideModal } from './components/HelpGuideModal';

export default function App() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-6 links) - Zone 3 (1-2 primary actions) */}
      <header className="w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark in characterful style */}
          <a
            href="/"
            className="font-pixel text-xs sm:text-sm tracking-wide text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            THE LEGEND OF ZELDA · ALTTP
          </a>

          {/* Zone 2: 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <a href="#game-cabinet" className="hover:text-amber-400 transition-colors">
              地城冒險
            </a>
            <a href="#features" className="hover:text-amber-400 transition-colors">
              炸彈與密室
            </a>
            <a href="#scoring" className="hover:text-amber-400 transition-colors">
              計分評價
            </a>
            <a href="#dungeon-lore" className="hover:text-amber-400 transition-colors">
              六大區域
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded font-pixel transition-colors whitespace-nowrap cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.3)]"
            >
              探險手冊
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Game Viewport */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col items-center">
        {/* Title & Context */}
        <div className="text-center mb-5 max-w-2xl">
          <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-pixel mb-2">
            <span>A LINK TO THE PAST</span>
            <span aria-hidden="true">·</span>
            <span>1991 經典復刻加強版</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            眾神的三角神力：地城迷宮
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed text-balance">
            新增炸彈破牆解謎與大妖精秘室，結合全方位冒險計分與評級系統（Rank S ~ C）。
            推移巨石解鎖機關、投擲陶壺擊破敵人，奪取聖堂黃金三角神力！
          </p>
        </div>

        {/* Central Game Cabinet */}
        <section id="game-cabinet" className="w-full flex justify-center">
          <GameCanvas />
        </section>

        {/* Desktop Quick Shortcuts Bar */}
        <div className="w-full max-w-4xl mt-6 p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex flex-wrap items-center justify-around gap-3 font-mono">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-300 font-bold text-[11px]">WASD</kbd>
            <span>/</span>
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-300 font-bold text-[11px]">方向鍵</kbd>
            <span>移動</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-emerald-400 font-bold text-[11px]">J</kbd>
            <span>/</span>
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-emerald-400 font-bold text-[11px]">Space</kbd>
            <span>揮劍 (長按迴旋斬)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-red-400 font-bold text-[11px]">B</kbd>
            <span>/</span>
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-red-400 font-bold text-[11px]">Q</kbd>
            <span>放置炸彈 💣</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-400 font-bold text-[11px]">K</kbd>
            <span>/</span>
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-amber-400 font-bold text-[11px]">E</kbd>
            <span>搬壺/投擲/開箱</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-rose-400 font-bold text-[11px]">R</kbd>
            <span>重新開始</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-sky-400 font-bold text-[11px]">M</kbd>
            <span>靜音切換</span>
          </div>
        </div>

        {/* 3. Game Features Showcase */}
        <section id="features" className="w-full max-w-4xl mt-12 pt-8 border-t border-zinc-800">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-amber-500">◆</span> 可破壞石牆與隱藏密室系統
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              地城各處隱藏著帶有微弱裂紋與藍色氣流的破裂石壁，等待真正的冒險家探索。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-red-400">
                <span>💣</span>
                <h3>炸彈轟炸與碎石崩塌</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                按 <kbd className="text-amber-300 bg-zinc-800 px-1 rounded">B</kbd> 或點擊炸彈鍵放置經典圓形黑鐵炸彈。引信燃燒 1.3 秒後引爆強烈衝擊波，
                不僅能直接轟破裂縫石牆，更能造成 4 點巨額範圍傷害秒殺周遭魔物！
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-cyan-400">
                <span>🧚</span>
                <h3>大妖精泉源與古代皇家秘寶庫</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                炸毀重石室北牆即可進入「大妖精神秘泉源」，漫步在水晶碧泉邊獲取紅盧比與妖精回復；
                炸毀守衛牢房北牆可發現「古代皇家秘寶庫」，開啟黃金寶箱取得永久提升生命上限的<span className="text-red-400 font-bold">【心之容器】</span>！
              </p>
            </div>
          </div>
        </section>

        {/* 4. Scoring System Section */}
        <section id="scoring" className="w-full max-w-4xl mt-12 pt-8 border-t border-zinc-800">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-amber-500">◆</span> 全方位冒險計分與評級系統
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              每一次操作都有實質回報，即時跳出飄動分數數字，並永久保存歷史最高紀錄。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-emerald-400 font-pixel text-[11px] mb-1">戰鬥與收集得分</div>
              <p className="text-zinc-400">
                擊敗巡邏衛兵 +100 分、紫翼蝙蝠 +50 分、首領黑鐵騎士 +1000 分；綠/藍/紅盧比分別獲得 +10 / +50 / +200 分。
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-amber-400 font-pixel text-[11px] mb-1">解謎與探索獎勵</div>
              <p className="text-zinc-400">
                炸毀裂牆發現密室 +500 分/間、解開地面重壓機關 +200 分、開啟小鑰匙寶箱 +250 分、心之容器寶箱 +600 分。
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-cyan-400 font-pixel text-[11px] mb-1">結算加成與 Rank 評級</div>
              <p className="text-zinc-400">
                通關時結算極速挑戰加成（最高 +3000 分）、剩餘生命加成與無傷通關榮譽加成（+1000 分），衝擊 Rank S 傳說勇者！
              </p>
            </div>
          </div>
        </section>

        {/* 5. Dungeon Lore & Map Section */}
        <section id="dungeon-lore" className="w-full max-w-4xl mt-12 pt-8 border-t border-zinc-800">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-amber-500">◆</span> 地城六大區域導覽
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              由原本的四座大廳擴展為六大區域，在小地圖上可即時確認所在方位：
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-amber-400 font-pixel text-[11px] mb-1">01. 入口聖堂 (中央)</div>
              <p className="text-xs text-zinc-400">
                火炬搖曳的起點。有巡邏士兵與藏有炸彈的陶壺。
              </p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-emerald-400 font-pixel text-[11px] mb-1">02. 守衛牢房 (東室)</div>
              <p className="text-xs text-zinc-400">
                綠鎧守衛巡邏地，開啟深處寶箱取得【小鑰匙 🔑】；北牆有裂縫密道。
              </p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-sky-400 font-pixel text-[11px] mb-1">03. 機關石室 (西室)</div>
              <p className="text-xs text-zinc-400">
                推重石壓下開關解開北門鎖；北牆帶有裂縫通往妖精泉。
              </p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-cyan-400 font-pixel text-[11px] mb-1">04. 妖精秘泉 (西密室)</div>
              <p className="text-xs text-zinc-400">
                隱藏泉源，擁有清澈碧泉、紅盧比寶庫與生命完全回復。
              </p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-purple-400 font-pixel text-[11px] mb-1">05. 皇家秘庫 (東密室)</div>
              <p className="text-xs text-zinc-400">
                古代寶庫，藏有永久擴增生命心之容器的金色大寶箱。
              </p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded">
              <div className="text-rose-400 font-pixel text-[11px] mb-1">06. 神力聖堂 (北室)</div>
              <p className="text-xs text-zinc-400">
                紅地毯終點，擊敗黑鐵騎士首領開啟中央寶箱取得 Triforce 獲勝！
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-amber-500 text-[10px]">ZELDA ALTTP WEB TRIBUTE</span>
            <span aria-hidden="true">·</span>
            <span>Inspired by Nintendo SNES (1991)</span>
          </div>
          <p className="text-[11px]">
            HTML5 Canvas & Web Audio API Pure Code Implementation
          </p>
        </div>
      </footer>

      {/* Help Modal */}
      {guideOpen && <HelpGuideModal onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
