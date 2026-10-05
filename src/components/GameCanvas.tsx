import React, { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from '../audio/soundEngine';
import { GameEngine, GameInputState } from '../game/gameEngine';
import { renderGame } from '../game/renderer';
import { GameStats, Player, RoomData } from '../types/game';
import { AudioSettingsBar } from './AudioSettingsBar';
import { GameOverModal } from './GameOverModal';
import { HelpGuideModal } from './HelpGuideModal';
import { RetroHUD } from './RetroHUD';
import { VictoryModal } from './VictoryModal';
import { VirtualControls } from './VirtualControls';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Input state
  const inputRef = useRef<GameInputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    attackPressed: false,
    interact: false,
    interactPressed: false,
    bombPressed: false,
    spinCharge: false,
  });

  // React state for reactive HUD & Modals
  const [playerState, setPlayerState] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [curRoomKey, setCurRoomKey] = useState<string>('0,0');
  const [roomsState, setRoomsState] = useState<Record<string, RoomData>>({});
  const [gameState, setGameState] = useState<'PLAY' | 'GAMEOVER' | 'VICTORY' | 'PAUSED'>('PLAY');
  const [message, setMessage] = useState<{ text: string; active: boolean }>({ text: '', active: false });
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats | null>(null);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }

  // Handle game reset
  const handleReset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      setGameState('PLAY');
      setPlayerState({ ...engineRef.current.player });
      setCurrentRoom(engineRef.current.rooms[engineRef.current.curRoomKey]);
      setCurRoomKey(engineRef.current.curRoomKey);
      setRoomsState({ ...engineRef.current.rooms });
      setStats({ ...engineRef.current.stats });
    }
  }, []);

  // Virtual buttons handlers
  const handleButtonDown = useCallback((button: 'up' | 'down' | 'left' | 'right' | 'attack' | 'interact') => {
    audioEngine.init();
    const input = inputRef.current;
    if (button === 'up') input.up = true;
    if (button === 'down') input.down = true;
    if (button === 'left') input.left = true;
    if (button === 'right') input.right = true;
    if (button === 'attack') {
      if (!input.attack) input.attackPressed = true;
      input.attack = true;
    }
    if (button === 'interact') {
      if (!input.interact) input.interactPressed = true;
      input.interact = true;
    }
  }, []);

  const handleButtonUp = useCallback((button: 'up' | 'down' | 'left' | 'right' | 'attack' | 'interact') => {
    const input = inputRef.current;
    if (button === 'up') input.up = false;
    if (button === 'down') input.down = false;
    if (button === 'left') input.left = false;
    if (button === 'right') input.right = false;
    if (button === 'attack') input.attack = false;
    if (button === 'interact') input.interact = false;
  }, []);

  const handleBombPress = useCallback(() => {
    audioEngine.init();
    inputRef.current.bombPressed = true;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audioEngine.init();

      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        inputRef.current.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        inputRef.current.down = true;
        e.preventDefault();
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        inputRef.current.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        inputRef.current.right = true;
        e.preventDefault();
      }
      if (['KeyJ', 'Space'].includes(e.code)) {
        if (!inputRef.current.attack) inputRef.current.attackPressed = true;
        inputRef.current.attack = true;
        e.preventDefault();
      }
      if (['KeyK', 'KeyE'].includes(e.code)) {
        if (!inputRef.current.interact) inputRef.current.interactPressed = true;
        inputRef.current.interact = true;
        e.preventDefault();
      }
      if (['KeyB', 'KeyQ'].includes(e.code)) {
        inputRef.current.bombPressed = true;
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        handleReset();
        e.preventDefault();
      }
      if (e.code === 'KeyM') {
        audioEngine.setMute(!audioEngine.getMuted());
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) inputRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) inputRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputRef.current.right = false;
      if (['KeyJ', 'Space'].includes(e.code)) inputRef.current.attack = false;
      if (['KeyK', 'KeyE'].includes(e.code)) inputRef.current.interact = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleReset]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let syncCounter = 0;

    const loop = () => {
      const engine = engineRef.current;
      if (engine && ctx) {
        // Step engine physics
        engine.update(inputRef.current);

        // Reset one-frame triggers
        inputRef.current.attackPressed = false;
        inputRef.current.interactPressed = false;
        inputRef.current.bombPressed = false;

        // Render current frame with bombs, explosions, and floating texts
        const currentRoomData = engine.rooms[engine.curRoomKey];
        renderGame(
          ctx,
          currentRoomData,
          engine.player,
          engine.flyingPots,
          engine.dropItems,
          engine.particles,
          engine.bombs,
          engine.explosions,
          engine.floatingTexts,
          engine.frameTime
        );

        // Sync React HUD state every 4 frames
        syncCounter++;
        if (syncCounter % 4 === 0) {
          setPlayerState({ ...engine.player });
          setCurrentRoom(currentRoomData);
          setCurRoomKey(engine.curRoomKey);
          setRoomsState({ ...engine.rooms });
          setGameState(engine.gameState);
          setMessage({
            text: engine.messageText,
            active: engine.messageTimer > 0,
          });
          setStats({ ...engine.stats });
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Game Bezel & Frame */}
      <div className="w-full max-w-[680px] bg-zinc-950 border-4 border-amber-800/80 rounded-xl overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(217,119,6,0.2)]">
        {/* Retro Top HUD */}
        {playerState && currentRoom && (
          <RetroHUD
            player={playerState}
            room={currentRoom}
            curRoomKey={curRoomKey}
            rooms={roomsState}
            highScore={stats?.highScore || 0}
          />
        )}

        {/* Canvas Display Viewport */}
        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain pixelated block"
          />

          {/* CRT Scanline Filter Overlay */}
          {crtEnabled && (
            <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-40 mix-blend-overlay" />
          )}

          {/* Overlay Message Banner */}
          {message.active && (
            <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="bg-zinc-950/90 border-2 border-amber-500 rounded p-3 text-center shadow-xl">
                <p className="font-pixel text-amber-200 text-xs sm:text-sm drop-shadow leading-relaxed">
                  {message.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio & Settings Toolbar */}
      <div className="w-full mt-3">
        <AudioSettingsBar
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(prev => !prev)}
          onOpenHelp={() => setHelpOpen(true)}
        />
      </div>

      {/* Virtual D-pad and Action Buttons */}
      <div className="w-full mt-1">
        <VirtualControls
          inputState={inputRef.current}
          onButtonDown={handleButtonDown}
          onButtonUp={handleButtonUp}
          onBombPress={handleBombPress}
          onReset={handleReset}
          bombsCount={playerState?.bombs ?? 0}
        />
      </div>

      {/* Modals */}
      {gameState === 'VICTORY' && stats && playerState && (
        <VictoryModal
          stats={stats}
          rupees={playerState.rupees}
          hp={playerState.hp}
          maxHp={playerState.maxHp}
          onRestart={handleReset}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal onRestart={handleReset} />
      )}

      {helpOpen && (
        <HelpGuideModal onClose={() => setHelpOpen(false)} />
      )}
    </div>
  );
};
