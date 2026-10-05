/**
 * SNES-style Pixel Art Canvas Renderer for Zelda: A Link to the Past tribute
 */

import {
  Bomb,
  BombExplosion,
  Chest,
  DIR,
  DropItem,
  Enemy,
  FloatingText,
  FlyingPot,
  Particle,
  Player,
  PushBlock,
  RoomData,
  SwitchPlate,
} from '../types/game';
import { COLS, ROWS, TILE } from './dungeonData';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  room: RoomData,
  player: Player,
  flyingPots: FlyingPot[],
  dropItems: DropItem[],
  particles: Particle[],
  bombs: Bomb[],
  explosions: BombExplosion[],
  floatingTexts: FloatingText[],
  frameTime: number
): void {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // Clear background
  ctx.fillStyle = '#0a0d12';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw floor tiles & carpets & water pools
  drawFloor(ctx, room, frameTime);

  // 2. Draw walls, cracked walls & architecture
  drawWalls(ctx, room, frameTime);

  // 3. Draw switches & pressure plates
  room.switches.forEach(sw => drawSwitch(ctx, sw));

  // 4. Draw pushable blocks
  room.blocks.forEach(b => drawBlock(ctx, b));

  // 5. Draw treasure chests
  room.chests.forEach(c => drawChest(ctx, c, frameTime));

  // 6. Draw floor pots
  room.pots.forEach(p => drawPot(ctx, p.x * TILE + 8, p.y * TILE + 8));

  // 7. Draw dropped items (rupees, hearts, bombs)
  dropItems.forEach(item => drawDropItem(ctx, item, frameTime));

  // 8. Draw active bombs on the floor
  bombs.forEach(b => drawBomb(ctx, b, frameTime));

  // 9. Draw shadows underneath dynamic entities
  drawShadow(ctx, player.x + 12, player.y + 22, 10, 4);
  room.enemies.forEach(e => {
    const radius = e.type === 'knight' ? 14 : e.type === 'bat' ? 6 : 9;
    drawShadow(ctx, e.x + e.w / 2, e.y + (e.type === 'bat' ? 24 : e.h - 2), radius, 4);
  });

  // 10. Draw enemies
  room.enemies.forEach(e => drawEnemy(ctx, e, frameTime));

  // 11. Draw flying pots
  flyingPots.forEach(p => {
    drawShadow(ctx, p.x + 12, p.y + 24, 8, 3);
    drawPot(ctx, p.x, p.y);
  });

  // 12. Draw Player (Link)
  drawPlayer(ctx, player, frameTime);

  // 13. Draw bomb explosions
  explosions.forEach(exp => drawExplosion(ctx, exp));

  // 14. Draw particles
  drawParticles(ctx, particles);

  // 15. Draw torches with dynamic lighting glow
  drawTorches(ctx, room, frameTime);

  // 16. Draw floating score & notification texts
  floatingTexts.forEach(ft => drawFloatingText(ctx, ft));
}

function drawFloor(ctx: CanvasRenderingContext2D, room: RoomData, frameTime: number): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = room.map[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (tile === 1 || tile === 7) continue; // Walls drawn in wall pass

      // Fairy Spring Water pool
      if (tile === 5) {
        const wave = Math.sin(frameTime * 0.08 + (r + c) * 0.6) * 3;
        ctx.fillStyle = '#083344';
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + 2, y + 2 + wave * 0.3, TILE - 4, TILE - 4);

        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x + 6, y + 6 + wave * 0.5, TILE - 12, TILE - 12);

        // Water specular sparkle
        if ((r * 7 + c * 13 + Math.floor(frameTime * 0.08)) % 4 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 12, y + 10, 4, 2);
          ctx.fillRect(x + 24, y + 22, 5, 2);
        }
        continue;
      }

      // Base stone tile palette
      let baseColor = (r + c) % 2 === 0 ? '#263342' : '#1f2b38';
      let borderColor = '#151d27';

      if (room.floorStyle === 'vault') {
        baseColor = (r + c) % 2 === 0 ? '#1f2930' : '#182127';
        borderColor = '#11171c';
      } else if (room.floorStyle === 'fairy_spring') {
        baseColor = (r + c) % 2 === 0 ? '#164e63' : '#155e75';
        borderColor = '#083344';
      }

      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, TILE, TILE);

      // Subtle stone brick grid lines
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

      // Random subtle stone blemishes for retro texture
      if ((r * 17 + c * 31) % 5 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x + 8, y + 8, 4, 2);
        ctx.fillRect(x + 18, y + 24, 6, 2);
      }

      // Royal Sanctum Red Carpet runner down the middle
      if (room.floorStyle === 'sanctum' && c >= 6 && c <= 9 && r >= 1 && r <= 10) {
        ctx.fillStyle = '#8b1c24';
        ctx.fillRect(x, y, TILE, TILE);

        // Gold fringe edges
        ctx.fillStyle = '#d4af37';
        if (c === 6) ctx.fillRect(x + 2, y, 3, TILE);
        if (c === 9) ctx.fillRect(x + TILE - 5, y, 3, TILE);

        // Carpet diamond motifs
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#a92832';
          ctx.beginPath();
          ctx.moveTo(x + 20, y + 8);
          ctx.lineTo(x + 32, y + 20);
          ctx.lineTo(x + 20, y + 32);
          ctx.lineTo(x + 8, y + 20);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D, room: RoomData, frameTime: number): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = room.map[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (tile === 1) {
        // High quality SNES relief wall
        ctx.fillStyle = '#5c6b73';
        ctx.fillRect(x, y, TILE, 8);

        ctx.fillStyle = '#39464e';
        ctx.fillRect(x, y + 8, TILE, TILE - 8);

        ctx.fillStyle = '#495861';
        ctx.fillRect(x + 2, y + 10, TILE - 4, 12);
        ctx.fillRect(x + 4, y + 24, TILE - 8, 12);

        ctx.strokeStyle = '#252e34';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);

        if (r < ROWS - 1 && room.map[r + 1][c] !== 1 && room.map[r + 1][c] !== 7) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(x, y + TILE, TILE, 6);
        }
      } else if (tile === 7) {
        // Cracked Destructible Wall (Can be bombed or smashed!)
        ctx.fillStyle = '#5c6b73';
        ctx.fillRect(x, y, TILE, 8);

        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y + 8, TILE, TILE - 8);

        // Weathered fractured stone
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 2, y + 10, TILE - 4, 12);
        ctx.fillRect(x + 4, y + 24, TILE - 8, 12);

        // Deep jagged fissure lines
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 6);
        ctx.lineTo(x + 18, y + 18);
        ctx.lineTo(x + 14, y + 26);
        ctx.lineTo(x + 26, y + 36);
        ctx.moveTo(x + 18, y + 18);
        ctx.lineTo(x + 28, y + 14);
        ctx.lineTo(x + 32, y + 26);
        ctx.stroke();

        // Pulsing mysterious light draft seeping through the cracks
        const glowAlpha = 0.4 + Math.sin(frameTime * 0.12) * 0.3;
        ctx.strokeStyle = `rgba(56, 189, 248, ${glowAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Rubble stone chunks at bottom of cracked wall
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 6, y + 34, 3, 3);
        ctx.fillRect(x + 18, y + 35, 4, 2);
        ctx.fillRect(x + 28, y + 33, 3, 3);
      } else if (tile === 6) {
        // Decorative Stone Pillar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 36, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475560';
        ctx.fillRect(x + 6, y + 26, 28, 12);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 10, y + 6, 20, 22);

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 12, y + 6, 4, 22);
        ctx.fillRect(x + 22, y + 6, 4, 22);

        ctx.fillStyle = '#475560';
        ctx.fillRect(x + 6, y + 2, 28, 6);
      } else if (tile === 3) {
        // Locked door (Iron portcullis with ornate padlock)
        ctx.fillStyle = '#1e242b';
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = '#475569';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + 6 + i * 8, y, 4, TILE);
        }

        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y + 18, TILE, 6);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 14, y + 14, 12, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 16, y + 16, 8, 4);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 16, y + 10, 8, 6);

        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 19, y + 22, 2, 4);
      } else if (tile === 4 || tile === 2) {
        // Open stone doorway / passage
        ctx.fillStyle = '#10151c';
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x, y, TILE, 6);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(x + 4, y + 6, TILE - 8, 6);
      }
    }
  }
}

function drawSwitch(ctx: CanvasRenderingContext2D, sw: SwitchPlate): void {
  const cx = sw.x * TILE + 20;
  const cy = sw.y * TILE + 20;

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sw.pressed ? '#10b981' : '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy, sw.pressed ? 8 : 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 3, sw.pressed ? 2 : 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlock(ctx: CanvasRenderingContext2D, b: PushBlock): void {
  const bx = b.x * TILE;
  const by = b.y * TILE;

  drawShadow(ctx, bx + 20, by + 36, 17, 6);

  ctx.fillStyle = '#64748b';
  ctx.fillRect(bx + 2, by + 2, 36, 36);

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(bx + 2, by + 2, 36, 4);
  ctx.fillRect(bx + 2, by + 2, 4, 36);

  ctx.fillStyle = '#334155';
  ctx.fillRect(bx + 2, by + 34, 36, 4);
  ctx.fillRect(bx + 34, by + 2, 4, 36);

  ctx.fillStyle = '#475569';
  ctx.fillRect(bx + 6, by + 6, 28, 28);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bx + 18, by + 10, 4, 20);
  ctx.fillRect(bx + 10, by + 18, 20, 4);
}

function drawChest(ctx: CanvasRenderingContext2D, c: Chest, frameTime: number): void {
  const cx = c.x * TILE;
  const cy = c.y * TILE;

  drawShadow(ctx, cx + 20, cy + 32, 16, 5);

  if (!c.opened) {
    const pulse = Math.sin(frameTime * 0.06) * 2;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx + 4, cy + 8, 32, 24);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx + 4, cy + 8, 6, 24);
    ctx.fillRect(cx + 30, cy + 8, 6, 24);
    ctx.fillRect(cx + 4, cy + 18, 32, 4);

    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx + 3, cy + 6, 34, 6);

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx + 17, cy + 18, 6, 8);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(cx + 19, cy + 22, 2, 3);

    if (Math.floor(frameTime * 0.05) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 28 + pulse, cy + 10, 3, 3);
    }
  } else {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(cx + 4, cy + 14, 32, 18);

    ctx.fillStyle = '#831843';
    ctx.fillRect(cx + 8, cy + 16, 24, 12);

    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx + 4, cy + 2, 32, 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx + 6, cy + 2, 5, 10);
    ctx.fillRect(cx + 29, cy + 2, 5, 10);
  }
}

function drawPot(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(x + 5, y + 2, 14, 3);

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(x + 3, y + 5, 18, 14);

  ctx.fillStyle = '#ea580c';
  ctx.fillRect(x + 2, y + 8, 20, 10);

  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(x + 1, y + 7, 2, 7);
  ctx.fillRect(x + 21, y + 7, 2, 7);

  ctx.fillStyle = '#fdba74';
  ctx.fillRect(x + 6, y + 9, 3, 7);
}

function drawDropItem(ctx: CanvasRenderingContext2D, item: DropItem, frameTime: number): void {
  const bob = Math.sin(frameTime * 0.12 + item.bounceOffset) * 3;
  const x = item.x;
  const y = item.y + bob;

  drawShadow(ctx, x + 8, item.y + 16, 7, 3);

  if (item.type === 'heart') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 4, Math.PI, 0, false);
    ctx.arc(x + 11, y + 5, 4, Math.PI, 0, false);
    ctx.lineTo(x + 8, y + 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 3, 2, 2);
  } else if (item.type === 'bomb') {
    // Bomb pickup item
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x + 8, y + 10, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 6, y + 2, 4, 3);

    // Fuse spark
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 8, y, 2, 2);
  } else {
    let gemColor = '#10b981'; // green (1)
    if (item.type === 'rupee_blue') gemColor = '#3b82f6'; // blue (5)
    if (item.type === 'rupee_red') gemColor = '#ef4444'; // red (20)

    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 2);
    ctx.lineTo(x + 14, y + 7);
    ctx.lineTo(x + 14, y + 13);
    ctx.lineTo(x + 8, y + 18);
    ctx.lineTo(x + 2, y + 13);
    ctx.lineTo(x + 2, y + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 4);
    ctx.lineTo(x + 12, y + 8);
    ctx.lineTo(x + 8, y + 14);
    ctx.lineTo(x + 4, y + 8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBomb(ctx: CanvasRenderingContext2D, b: Bomb, frameTime: number): void {
  drawShadow(ctx, b.x + 10, b.y + 18, 9, 4);

  // Urgent flash when timer is low
  const isUrgent = b.timer < 30 && Math.floor(frameTime * 0.5) % 2 === 0;

  // Bomb body
  ctx.fillStyle = isUrgent ? '#ef4444' : '#0f172a';
  ctx.beginPath();
  ctx.arc(b.x + 10, b.y + 10, 9, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = isUrgent ? '#fca5a5' : '#64748b';
  ctx.beginPath();
  ctx.arc(b.x + 7, b.y + 7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cap / Neck
  ctx.fillStyle = '#475569';
  ctx.fillRect(b.x + 8, b.y - 1, 4, 3);

  // Burning Sizzling Fuse
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + 10, b.y - 1);
  ctx.quadraticCurveTo(b.x + 14, b.y - 5, b.x + 12, b.y - 7);
  ctx.stroke();

  // Sizzle Sparkle
  ctx.fillStyle = Math.random() < 0.5 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(b.x + 11, b.y - 8, 3, 3);
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: BombExplosion): void {
  const progress = 1 - exp.life / exp.maxLife;
  const currentRadius = exp.radius * (0.4 + progress * 0.6);

  // Outer orange shockwave
  ctx.fillStyle = `rgba(234, 88, 12, ${Math.max(0, 0.7 - progress * 0.7)})`;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, currentRadius, 0, Math.PI * 2);
  ctx.fill();

  // Mid fiery ring
  ctx.fillStyle = `rgba(250, 204, 21, ${Math.max(0, 0.85 - progress * 0.85)})`;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, currentRadius * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // White hot core
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - progress * 1.5)})`;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, currentRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, frameTime: number): void {
  if (p.invincibleTimer > 0 && Math.floor(frameTime * 0.4) % 2 === 0) {
    return;
  }

  const x = p.x;
  const y = p.y;
  const dir = p.dir;
  const walkBob = p.walkCounter > 0 ? (p.walkFrame === 0 ? 0 : p.walkFrame === 1 ? -1 : 1) : 0;

  if (p.heldPot) {
    drawPot(ctx, x + 2, y - 18 + walkBob);
  }

  ctx.fillStyle = '#15803d';
  ctx.fillRect(x + 4, y + 8 + walkBob, 16, 12);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 4, y + 14 + walkBob, 16, 3);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x + 11, y + 14 + walkBob, 3, 3);

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x + 6, y + 20 + walkBob, 4, 3);
  ctx.fillRect(x + 14, y + 20 + walkBob, 4, 3);

  ctx.fillStyle = '#92400e';
  if (dir === DIR.LEFT) {
    ctx.fillRect(x + 4, y + 22 + walkBob, 6, 3);
    ctx.fillRect(x + 12, y + 22 - walkBob, 5, 3);
  } else if (dir === DIR.RIGHT) {
    ctx.fillRect(x + 6, y + 22 + walkBob, 5, 3);
    ctx.fillRect(x + 14, y + 22 - walkBob, 6, 3);
  } else {
    ctx.fillRect(x + 5, y + 22 + walkBob, 5, 3);
    ctx.fillRect(x + 14, y + 22 - walkBob, 5, 3);
  }

  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(x + 4, y + 2 + walkBob, 16, 7);

  ctx.fillStyle = '#fcd34d';
  ctx.fillRect(x + 6, y + 3 + walkBob, 12, 3);

  ctx.fillStyle = '#fed7aa';
  if (dir === DIR.UP) {
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + 5, y + 3 + walkBob, 14, 6);
  } else if (dir === DIR.DOWN) {
    ctx.fillRect(x + 6, y + 5 + walkBob, 12, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 8, y + 6 + walkBob, 2, 2);
    ctx.fillRect(x + 14, y + 6 + walkBob, 2, 2);
  } else if (dir === DIR.LEFT) {
    ctx.fillRect(x + 4, y + 5 + walkBob, 10, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 5, y + 6 + walkBob, 2, 2);
  } else if (dir === DIR.RIGHT) {
    ctx.fillRect(x + 10, y + 5 + walkBob, 10, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 17, y + 6 + walkBob, 2, 2);
  }

  ctx.fillStyle = '#16a34a';
  if (dir === DIR.UP) {
    ctx.fillRect(x + 6, y - 3 + walkBob, 12, 6);
    ctx.fillRect(x + 8, y - 6 + walkBob, 8, 4);
  } else if (dir === DIR.DOWN) {
    ctx.fillRect(x + 6, y - 1 + walkBob, 12, 5);
    ctx.fillRect(x + 9, y - 4 + walkBob, 6, 3);
  } else if (dir === DIR.LEFT) {
    ctx.fillRect(x + 6, y - 1 + walkBob, 12, 5);
    ctx.fillRect(x + 13, y + 1 + walkBob, 6, 3);
  } else if (dir === DIR.RIGHT) {
    ctx.fillRect(x + 6, y - 1 + walkBob, 12, 5);
    ctx.fillRect(x + 5, y + 1 + walkBob, 6, 3);
  }

  if (!p.heldPot) {
    ctx.fillStyle = '#2563eb';
    if (dir === DIR.RIGHT) {
      ctx.fillRect(x + 3, y + 8 + walkBob, 5, 12);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(x + 4, y + 12 + walkBob, 3, 4);
    } else if (dir === DIR.LEFT) {
      ctx.fillRect(x + 16, y + 8 + walkBob, 5, 12);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(x + 17, y + 12 + walkBob, 3, 4);
    } else if (dir === DIR.DOWN) {
      ctx.fillRect(x + 1, y + 9 + walkBob, 5, 11);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(x + 2, y + 12 + walkBob, 3, 4);
    } else if (dir === DIR.UP) {
      ctx.fillRect(x + 8, y + 9 + walkBob, 8, 10);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(x + 10, y + 12 + walkBob, 4, 3);
    }
  }

  if (p.isAttacking && !p.heldPot) {
    drawSwordSlash(ctx, p);
  }

  if (p.spinCharge > 0) {
    const chargeRatio = Math.min(1, p.spinCharge / 40);
    ctx.strokeStyle = chargeRatio >= 1 ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 18 + Math.sin(frameTime * 0.3) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (p.isSpinAttacking) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 28, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSwordSlash(ctx: CanvasRenderingContext2D, p: Player): void {
  const x = p.x;
  const y = p.y;
  const dir = p.dir;

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.fillStyle = '#e2e8f0';

  if (dir === DIR.UP) {
    ctx.arc(x + 12, y + 10, 30, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fillRect(x + 10, y - 20, 4, 20);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 7, y - 1, 10, 3);
  } else if (dir === DIR.DOWN) {
    ctx.arc(x + 12, y + 12, 30, Math.PI * 0.1, Math.PI * 0.9);
    ctx.fillRect(x + 10, y + 24, 4, 20);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 7, y + 22, 10, 3);
  } else if (dir === DIR.LEFT) {
    ctx.arc(x + 14, y + 12, 30, Math.PI * 0.6, Math.PI * 1.4);
    ctx.fillRect(x - 20, y + 10, 20, 4);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x - 2, y + 7, 3, 10);
  } else if (dir === DIR.RIGHT) {
    ctx.arc(x + 10, y + 12, 30, Math.PI * 1.6, Math.PI * 2.4);
    ctx.fillRect(x + 24, y + 10, 20, 4);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 22, y + 7, 3, 10);
  }
  ctx.stroke();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, frameTime: number): void {
  if (e.invulnerableTimer > 0 && Math.floor(frameTime * 0.4) % 2 === 0) {
    return;
  }

  if (e.type === 'soldier') {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(e.x + 2, e.y + 4, 20, 18);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(e.x + 4, e.y - 2, 16, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(e.x + 8, e.y - 7, 8, 6);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(e.x + 6, e.y + 2, 12, 2);

    ctx.fillStyle = '#cbd5e1';
    if (e.dir === DIR.LEFT) {
      ctx.fillRect(e.x - 14, e.y + 10, 16, 3);
      ctx.fillRect(e.x - 18, e.y + 8, 6, 7);
    } else {
      ctx.fillRect(e.x + 18, e.y + 10, 16, 3);
      ctx.fillRect(e.x + 32, e.y + 8, 6, 7);
    }
  } else if (e.type === 'bat') {
    const flap = Math.sin(frameTime * 0.3) * 6;

    ctx.fillStyle = '#7e22ce';
    ctx.beginPath();
    ctx.arc(e.x + 10, e.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(e.x + 6, e.y + 8, 2, 2);
    ctx.fillRect(e.x + 12, e.y + 8, 2, 2);

    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(e.x - 6, e.y + 6 + flap);
    ctx.lineTo(e.x + 4, e.y + 10);
    ctx.moveTo(e.x + 26, e.y + 6 + flap);
    ctx.lineTo(e.x + 16, e.y + 10);
    ctx.stroke();
  } else if (e.type === 'knight') {
    const isEnraged = e.hp <= 3;

    if (isEnraged) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(e.x + 16, e.y + 16, 26 + Math.sin(frameTime * 0.3) * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = isEnraged ? '#991b1b' : '#b91c1c';
    ctx.fillRect(e.x + 4, e.y + 6, 24, 24);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(e.x + 4, e.y + 6, 24, 3);
    ctx.fillRect(e.x + 4, e.y + 27, 24, 3);

    ctx.fillStyle = '#334155';
    ctx.fillRect(e.x + 6, e.y - 4, 20, 12);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(e.x + 2, e.y - 8, 4, 8);
    ctx.fillRect(e.x + 26, e.y - 8, 4, 8);

    ctx.fillStyle = isEnraged ? '#facc15' : '#ffffff';
    ctx.fillRect(e.x + 10, e.y + 1, 12, 3);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(e.x + 28, e.y + 4, 6, 26);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(e.x + 26, e.y + 12, 10, 4);

    const healthRatio = e.hp / e.maxHp;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(e.x - 2, e.y - 16, 36, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(e.x - 1, e.y - 15, 34 * healthRatio, 4);
  }
}

function drawTorches(ctx: CanvasRenderingContext2D, room: RoomData, frameTime: number): void {
  room.torches.forEach(t => {
    const tx = t.x * TILE + 20;
    const ty = t.y * TILE + 16;
    const flicker = Math.sin(frameTime * 0.2 + t.flameCycle) * 3;

    const glowGradient = ctx.createRadialGradient(tx, ty, 6, tx, ty, 64 + flicker * 2);
    glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    glowGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(tx, ty, 64 + flicker * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(tx - 4, ty + 4, 8, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tx - 2, ty + 12, 4, 6);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(tx, ty, 7 + flicker * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tx, ty - 1, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(tx, ty - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach(p => {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;
}

function drawFloatingText(ctx: CanvasRenderingContext2D, ft: FloatingText): void {
  const alpha = Math.max(0, ft.life / ft.maxLife);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';

  // Text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

  ctx.fillStyle = ft.color;
  ctx.fillText(ft.text, ft.x, ft.y);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1.0;
}
