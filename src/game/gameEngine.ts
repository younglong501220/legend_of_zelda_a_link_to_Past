/**
 * Zelda A Link to the Past Game Engine & Physics
 * Includes Bombs, Destructible Walls, Secret Rooms, and Scoring System
 */

import { audioEngine } from '../audio/soundEngine';
import {
  Bomb,
  BombExplosion,
  DIR,
  DropItem,
  Enemy,
  FloatingText,
  FlyingPot,
  GameStats,
  GameState,
  Particle,
  Player,
  RoomData,
} from '../types/game';
import { COLS, getInitialDungeon, ROWS, TILE } from './dungeonData';

export interface GameInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  attackPressed: boolean;
  interact: boolean;
  interactPressed: boolean;
  bombPressed: boolean;
  spinCharge: boolean;
}

export class GameEngine {
  public rooms: Record<string, RoomData>;
  public curRoomKey: string = '0,0';
  public player: Player;
  public flyingPots: FlyingPot[] = [];
  public dropItems: DropItem[] = [];
  public particles: Particle[] = [];
  public bombs: Bomb[] = [];
  public explosions: BombExplosion[] = [];
  public floatingTexts: FloatingText[] = [];
  public gameState: GameState = 'PLAY';
  public messageText: string = '探索地城，擊敗暗黑騎士，尋找三角神力！';
  public messageTimer: number = 200;
  public frameTime: number = 0;
  public stats: GameStats;

  constructor() {
    this.rooms = getInitialDungeon();
    this.player = this.createDefaultPlayer();
    const storedHighScore = parseInt(localStorage.getItem('zelda_alttp_highscore') || '0', 10);
    this.stats = {
      score: 0,
      highScore: isNaN(storedHighScore) ? 0 : storedHighScore,
      enemiesDefeated: 0,
      potsBroken: 0,
      rupeesCollected: 0,
      damageTaken: 0,
      secretRoomsFound: 0,
      bombsUsed: 0,
      startTime: Date.now(),
    };
  }

  public reset(): void {
    this.rooms = getInitialDungeon();
    this.curRoomKey = '0,0';
    this.player = this.createDefaultPlayer();
    this.flyingPots = [];
    this.dropItems = [];
    this.particles = [];
    this.bombs = [];
    this.explosions = [];
    this.floatingTexts = [];
    this.gameState = 'PLAY';
    this.messageText = '進入地城！按 [B] 放置炸彈，炸毀有裂縫的石牆尋找密室！';
    this.messageTimer = 200;
    this.frameTime = 0;
    const storedHighScore = parseInt(localStorage.getItem('zelda_alttp_highscore') || '0', 10);
    this.stats = {
      score: 0,
      highScore: isNaN(storedHighScore) ? 0 : storedHighScore,
      enemiesDefeated: 0,
      potsBroken: 0,
      rupeesCollected: 0,
      damageTaken: 0,
      secretRoomsFound: 0,
      bombsUsed: 0,
      startTime: Date.now(),
    };
  }

  private createDefaultPlayer(): Player {
    return {
      x: 308,
      y: 360,
      w: 24,
      h: 24,
      speed: 3.2,
      dir: DIR.UP,
      maxHp: 6, // 3 full hearts (2 HP per heart)
      hp: 6,
      keys: 0,
      rupees: 0,
      bombs: 3,
      maxBombs: 10,
      score: 0,
      secretRoomsFound: 0,
      hasTriforce: false,
      hasGlove: true,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      isSpinAttacking: false,
      spinCharge: 0,
      spinAngle: 0,
      heldPot: false,
      invincibleTimer: 0,
      walkFrame: 0,
      walkCounter: 0,
    };
  }

  public showMessage(text: string, duration: number = 150): void {
    this.messageText = text;
    this.messageTimer = duration;
  }

  public addScore(points: number, x: number, y: number, label?: string): void {
    this.player.score += points;
    this.stats.score = this.player.score;

    if (this.player.score > this.stats.highScore) {
      this.stats.highScore = this.player.score;
      localStorage.setItem('zelda_alttp_highscore', this.stats.highScore.toString());
    }

    const displayText = label ? `+${points} ${label}` : `+${points}`;
    this.floatingTexts.push({
      id: Math.random().toString(),
      text: displayText,
      x: Math.max(20, Math.min(COLS * TILE - 40, x)),
      y: Math.max(30, y),
      color: points >= 500 ? '#facc15' : points >= 200 ? '#38bdf8' : '#34d399',
      life: 45,
      maxLife: 45,
    });
  }

  public update(input: GameInputState): void {
    if (this.gameState !== 'PLAY') return;

    this.frameTime++;
    const room = this.rooms[this.curRoomKey];

    // Message timer
    if (this.messageTimer > 0) this.messageTimer--;

    // Low health warning
    if (this.player.hp <= 2 && this.player.hp > 0) {
      audioEngine.lowHealthCheck();
    }

    // Player invincibility timer
    if (this.player.invincibleTimer > 0) this.player.invincibleTimer--;

    // Attack cooldown
    if (this.player.attackCooldown > 0) this.player.attackCooldown--;

    // Spin attack timer
    if (this.player.isSpinAttacking) {
      this.player.attackTimer--;
      if (this.player.attackTimer <= 0) {
        this.player.isSpinAttacking = false;
      }
    } else if (this.player.isAttacking) {
      this.player.attackTimer--;
      if (this.player.attackTimer <= 0) {
        this.player.isAttacking = false;
      }
    }

    // 1. Bomb Placement
    if (input.bombPressed) {
      if (this.player.bombs > 0) {
        this.player.bombs--;
        this.stats.bombsUsed++;
        audioEngine.bombPlace();
        this.bombs.push({
          id: Math.random().toString(),
          x: this.player.x + 2,
          y: this.player.y + 4,
          vx: 0,
          vy: 0,
          timer: 80,
          maxTimer: 80,
          radius: 46,
        });
      } else {
        this.showMessage('炸彈用完了！搬開陶壺或擊倒敵人可能獲得炸彈補給。', 120);
      }
    }

    // 2. Attack / Spin Attack Charging
    if (input.attack && !this.player.heldPot && !this.player.isAttacking && !this.player.isSpinAttacking) {
      if (this.player.spinCharge < 50) {
        this.player.spinCharge++;
        if (this.player.spinCharge === 40) {
          audioEngine.spinCharge(1.0);
          this.createSparkleRing(this.player.x + 12, this.player.y + 12, '#38bdf8', 12);
        }
      }
    } else if (!input.attack && this.player.spinCharge >= 40 && !this.player.heldPot) {
      // Release Spin Attack!
      this.player.spinCharge = 0;
      this.player.isSpinAttacking = true;
      this.player.attackTimer = 16;
      audioEngine.spinRelease();
      this.createSparkleRing(this.player.x + 12, this.player.y + 12, '#facc15', 18);
      this.triggerSpinAttackDamage(room);
    } else if (!input.attack) {
      this.player.spinCharge = 0;
    }

    // Normal sword slash trigger
    if (
      input.attackPressed &&
      !this.player.isAttacking &&
      !this.player.isSpinAttacking &&
      this.player.attackCooldown === 0 &&
      !this.player.heldPot
    ) {
      this.player.isAttacking = true;
      this.player.attackTimer = 14;
      this.player.attackCooldown = 18;
      audioEngine.sword();
      this.triggerSwordDamage(room);
    }

    // 3. Interact / Lift / Throw Pot / Open Chest
    if (input.interactPressed) {
      if (this.player.heldPot) {
        // Throw pot!
        audioEngine.sword();
        let vx = 0;
        let vy = 0;
        if (this.player.dir === DIR.UP) vy = -6.5;
        if (this.player.dir === DIR.DOWN) vy = 6.5;
        if (this.player.dir === DIR.LEFT) vx = -6.5;
        if (this.player.dir === DIR.RIGHT) vx = 6.5;

        this.flyingPots.push({
          x: this.player.x + (vx < 0 ? -4 : vx > 0 ? 4 : 0),
          y: this.player.y + (vy < 0 ? -4 : vy > 0 ? 4 : 0),
          vx,
          vy,
          life: 42,
        });
        this.player.heldPot = false;
      } else {
        // Try lifting pot
        const reachX = this.player.x + (this.player.dir === DIR.RIGHT ? 28 : this.player.dir === DIR.LEFT ? -18 : 6);
        const reachY = this.player.y + (this.player.dir === DIR.DOWN ? 28 : this.player.dir === DIR.UP ? -18 : 6);
        const potCol = Math.floor(reachX / TILE);
        const potRow = Math.floor(reachY / TILE);

        const potIndex = room.pots.findIndex(p => p.x === potCol && p.y === potRow);
        if (potIndex !== -1) {
          const removedPot = room.pots.splice(potIndex, 1)[0];
          this.player.heldPot = true;
          this.stats.potsBroken++;
          audioEngine.hit();

          if (removedPot.contains === 'heart') {
            this.spawnDropItem(potCol * TILE + 12, potRow * TILE + 12, 'heart');
          } else if (removedPot.contains === 'rupee_green') {
            this.spawnDropItem(potCol * TILE + 12, potRow * TILE + 12, 'rupee_green');
          } else if (removedPot.contains === 'rupee_blue') {
            this.spawnDropItem(potCol * TILE + 12, potRow * TILE + 12, 'rupee_blue');
          } else if (removedPot.contains === 'rupee_red') {
            this.spawnDropItem(potCol * TILE + 12, potRow * TILE + 12, 'rupee_red');
          } else if (removedPot.contains === 'bomb') {
            this.spawnDropItem(potCol * TILE + 12, potRow * TILE + 12, 'bomb');
          }
        } else {
          // Check chests in reach
          room.chests.forEach(c => {
            const chestCenter = { x: c.x * TILE + 20, y: c.y * TILE + 20 };
            const playerCenter = { x: this.player.x + 12, y: this.player.y + 12 };
            const dist = Math.hypot(chestCenter.x - playerCenter.x, chestCenter.y - playerCenter.y);

            if (dist < 44 && !c.opened) {
              c.opened = true;
              if (c.item === 'key') {
                this.player.keys++;
                audioEngine.itemGet();
                this.addScore(250, chestCenter.x, chestCenter.y, '獲得小鑰匙!');
                this.showMessage('獲得【地城小鑰匙】！可以用來打開鎖住的厚重大門！', 180);
                this.createSparkleRing(c.x * TILE + 20, c.y * TILE + 20, '#fbbf24', 16);
              } else if (c.item === 'heart_container') {
                // Heart Container upgrade: +2 HP max, heals to full!
                this.player.maxHp += 2;
                this.player.hp = this.player.maxHp;
                audioEngine.itemGet();
                this.addScore(600, chestCenter.x, chestCenter.y, '心之容器!');
                this.showMessage('獲得【完整心之容器】！生命上限提升，體力全滿！', 200);
                this.createSparkleRing(c.x * TILE + 20, c.y * TILE + 20, '#ef4444', 24);
              } else if (c.item === 'rupees_50') {
                this.player.rupees += 50;
                this.stats.rupeesCollected += 50;
                audioEngine.secret();
                this.addScore(500, chestCenter.x, chestCenter.y, '盧比寶藏!');
                this.showMessage('獲得秘室寶藏【50 顆盧比】！', 180);
                this.createSparkleRing(c.x * TILE + 20, c.y * TILE + 20, '#10b981', 20);
              } else if (c.item === 'triforce') {
                this.player.hasTriforce = true;
                this.gameState = 'VICTORY';
                this.stats.finishTime = Date.now();

                // Calculate comprehensive final score with speed bonus & pristine bonus
                const elapsedSec = Math.floor((this.stats.finishTime - this.stats.startTime) / 1000);
                const speedBonus = Math.max(0, 3000 - elapsedSec * 15);
                const healthBonus = this.player.hp * 100;
                const secretBonus = this.player.secretRoomsFound * 500;
                const pristineBonus = this.stats.damageTaken === 0 ? 1000 : 0;
                const totalFinalScore = this.player.score + 1500 + speedBonus + healthBonus + secretBonus + pristineBonus;

                this.player.score = totalFinalScore;
                this.stats.score = totalFinalScore;
                if (totalFinalScore > this.stats.highScore) {
                  this.stats.highScore = totalFinalScore;
                  localStorage.setItem('zelda_alttp_highscore', totalFinalScore.toString());
                }

                // Rank
                if (totalFinalScore >= 5000) this.stats.rank = 'S';
                else if (totalFinalScore >= 3500) this.stats.rank = 'A';
                else if (totalFinalScore >= 2000) this.stats.rank = 'B';
                else this.stats.rank = 'C';

                audioEngine.triforceFanfare();
                this.createSparkleRing(c.x * TILE + 20, c.y * TILE + 20, '#facc15', 30);
              }
            }
          });
        }
      }
    }

    // 4. Movement Physics
    if (!this.player.isAttacking && !this.player.isSpinAttacking) {
      let dx = 0;
      let dy = 0;

      if (input.up) {
        dy -= this.player.speed;
        this.player.dir = DIR.UP;
      }
      if (input.down) {
        dy += this.player.speed;
        this.player.dir = DIR.DOWN;
      }
      if (input.left) {
        dx -= this.player.speed;
        this.player.dir = DIR.LEFT;
      }
      if (input.right) {
        dx += this.player.speed;
        this.player.dir = DIR.RIGHT;
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      const isMoving = dx !== 0 || dy !== 0;
      if (isMoving) {
        this.player.walkCounter++;
        if (this.player.walkCounter % 8 === 0) {
          this.player.walkFrame = (this.player.walkFrame + 1) % 4;
        }
      } else {
        this.player.walkCounter = 0;
        this.player.walkFrame = 0;
      }

      // X-axis collision
      if (dx !== 0) {
        const testX = this.player.x + dx + (dx > 0 ? this.player.w : 0);
        if (!this.isSolid(testX, this.player.y + 6, room) && !this.isSolid(testX, this.player.y + this.player.h - 2, room)) {
          this.player.x += dx;
        }
      }

      // Y-axis collision
      if (dy !== 0) {
        const testY = this.player.y + dy + (dy > 0 ? this.player.h : 0);
        if (!this.isSolid(this.player.x + 4, testY, room) && !this.isSolid(this.player.x + this.player.w - 4, testY, room)) {
          this.player.y += dy;
        }
      }

      // Push Stone Mechanism
      room.blocks.forEach(b => {
        const bx = b.x * TILE;
        const by = b.y * TILE;
        const dist = Math.hypot(this.player.x + 12 - (bx + 20), this.player.y + 12 - (by + 20));

        if (dist < 34) {
          const prevX = b.x;
          const prevY = b.y;

          if (this.player.dir === DIR.UP && input.up) b.y -= 0.05;
          if (this.player.dir === DIR.DOWN && input.down) b.y += 0.05;
          if (this.player.dir === DIR.LEFT && input.left) b.x -= 0.05;
          if (this.player.dir === DIR.RIGHT && input.right) b.x += 0.05;

          const bTileCol = Math.floor((b.x * TILE + 20) / TILE);
          const bTileRow = Math.floor((b.y * TILE + 20) / TILE);
          if (
            bTileCol < 1 ||
            bTileCol >= COLS - 1 ||
            bTileRow < 1 ||
            bTileRow >= ROWS - 1 ||
            room.map[bTileRow][bTileCol] === 1 ||
            room.map[bTileRow][bTileCol] === 6 ||
            room.map[bTileRow][bTileCol] === 7
          ) {
            b.x = prevX;
            b.y = prevY;
          } else {
            if (Math.random() < 0.2) {
              audioEngine.pushBlock();
              this.createDustPuff(b.x * TILE + 20, b.y * TILE + 36);
            }
          }
        }
      });

      // Switch Plates Detection
      room.switches.forEach(sw => {
        const swX = sw.x * TILE + 20;
        const swY = sw.y * TILE + 20;
        const pDist = Math.hypot(this.player.x + 12 - swX, this.player.y + 12 - swY);
        const blockOnSwitch = room.blocks.some(
          b => Math.hypot(b.x * TILE + 20 - swX, b.y * TILE + 20 - swY) < 22
        );

        if ((pDist < 20 || blockOnSwitch) && !sw.pressed) {
          sw.pressed = true;
          audioEngine.secret();
          this.addScore(200, swX, swY, '解開機關!');
          this.showMessage('機關已被重壓觸發！北方的門鎖解除了！', 200);

          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (room.map[r][c] === 3) room.map[r][c] = 4;
            }
          }
          this.createSparkleRing(swX, swY, '#10b981', 16);
        }
      });
    }

    // 5. Bombs Update & Explosions
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.timer--;

      if (bomb.timer <= 0) {
        this.triggerBombExplosion(bomb, room);
        this.bombs.splice(i, 1);
      }
    }

    // Explosions Decay
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life--;
      if (exp.life <= 0) {
        this.explosions.splice(i, 1);
      }
    }

    // 6. Flying Pots Update
    for (let i = this.flyingPots.length - 1; i >= 0; i--) {
      const pot = this.flyingPots[i];
      pot.x += pot.vx;
      pot.y += pot.vy;
      pot.life--;

      const potTileCol = Math.floor((pot.x + 12) / TILE);
      const potTileRow = Math.floor((pot.y + 12) / TILE);

      // Check if flying pot hits a cracked wall!
      if (
        potTileCol >= 0 &&
        potTileCol < COLS &&
        potTileRow >= 0 &&
        potTileRow < ROWS &&
        room.map[potTileRow][potTileCol] === 7
      ) {
        this.destroyCrackedWall(room, potTileCol, potTileRow);
        audioEngine.smash();
        this.createClayShards(pot.x + 12, pot.y + 12);
        this.flyingPots.splice(i, 1);
        continue;
      }

      if (this.isSolid(pot.x + 12, pot.y + 12, room) || pot.life <= 0) {
        audioEngine.smash();
        this.createClayShards(pot.x + 12, pot.y + 12);
        this.flyingPots.splice(i, 1);
        continue;
      }

      room.enemies.forEach((enemy, eIdx) => {
        if (Math.hypot(pot.x + 12 - (enemy.x + enemy.w / 2), pot.y + 12 - (enemy.y + enemy.h / 2)) < 26) {
          enemy.hp -= 2;
          audioEngine.smash();
          audioEngine.hit();
          this.createClayShards(pot.x + 12, pot.y + 12);
          this.createSparkleRing(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ef4444', 8);
          this.flyingPots.splice(i, 1);

          if (enemy.hp <= 0) {
            this.handleEnemyDefeat(enemy, eIdx, room);
          }
        }
      });
    }

    // 7. Enemies AI & Collision
    room.enemies.forEach(enemy => {
      if (enemy.invulnerableTimer > 0) enemy.invulnerableTimer--;

      if (enemy.type === 'soldier') {
        enemy.x += enemy.vx;
        const checkX = enemy.x + (enemy.vx > 0 ? enemy.w + 6 : -6);
        if (this.isSolid(checkX, enemy.y + 10, room)) {
          enemy.vx *= -1;
          enemy.dir = enemy.vx > 0 ? DIR.RIGHT : DIR.LEFT;
        }
      } else if (enemy.type === 'bat') {
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
      } else if (enemy.type === 'knight') {
        const isEnraged = enemy.hp <= 3;
        const currentSpeed = isEnraged ? 2.2 : 1.4;
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          enemy.x += Math.sign(dx) * currentSpeed;
          enemy.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
        } else {
          enemy.y += Math.sign(dy) * currentSpeed;
          enemy.dir = dy > 0 ? DIR.DOWN : DIR.UP;
        }
      }

      // Damage Player
      const eCenterX = enemy.x + enemy.w / 2;
      const eCenterY = enemy.y + enemy.h / 2;
      const pCenterX = this.player.x + 12;
      const pCenterY = this.player.y + 12;

      if (this.player.invincibleTimer === 0 && Math.hypot(pCenterX - eCenterX, pCenterY - eCenterY) < 24) {
        this.player.hp -= 1;
        this.player.invincibleTimer = 65;
        this.stats.damageTaken += 1;
        audioEngine.hit();

        const angle = Math.atan2(pCenterY - eCenterY, pCenterX - eCenterX);
        this.player.x += Math.cos(angle) * 28;
        this.player.y += Math.sin(angle) * 28;

        this.createSparkleRing(pCenterX, pCenterY, '#ef4444', 8);

        if (this.player.hp <= 0) {
          this.gameState = 'GAMEOVER';
          audioEngine.gameOver();
          this.showMessage('你倒下了... 按 [R] 鍵重新啟程！', 9999);
        }
      }
    });

    // 8. Dropped Item Pickups
    for (let i = this.dropItems.length - 1; i >= 0; i--) {
      const item = this.dropItems[i];
      item.life--;
      if (item.life <= 0) {
        this.dropItems.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(this.player.x + 12 - (item.x + 8), this.player.y + 12 - (item.y + 8));
      if (dist < 22) {
        if (item.type === 'heart') {
          if (this.player.hp < this.player.maxHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
            audioEngine.heart();
            this.createSparkleRing(item.x + 8, item.y + 8, '#ef4444', 8);
            this.dropItems.splice(i, 1);
          }
        } else if (item.type === 'bomb') {
          this.player.bombs = Math.min(this.player.maxBombs, this.player.bombs + 2);
          audioEngine.itemGet();
          this.addScore(30, item.x, item.y, '+2 炸彈');
          this.createSparkleRing(item.x + 8, item.y + 8, '#f59e0b', 8);
          this.dropItems.splice(i, 1);
        } else {
          // Rupees
          let value = 1;
          let scorePts = 10;
          if (item.type === 'rupee_blue') {
            value = 5;
            scorePts = 50;
          }
          if (item.type === 'rupee_red') {
            value = 20;
            scorePts = 200;
          }

          this.player.rupees += value;
          this.stats.rupeesCollected += value;
          audioEngine.rupee();
          this.addScore(scorePts, item.x, item.y);
          this.createSparkleRing(item.x + 8, item.y + 8, '#10b981', 8);
          this.dropItems.splice(i, 1);
        }
      }
    }

    // 9. Room Transition & Doors
    this.checkRoomTransition();

    // 10. Particles Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 11. Floating Texts Update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.6;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private triggerBombExplosion(bomb: Bomb, room: RoomData): void {
    const expX = bomb.x + 10;
    const expY = bomb.y + 10;
    audioEngine.bombExplosion();

    this.explosions.push({
      id: Math.random().toString(),
      x: expX,
      y: expY,
      radius: bomb.radius,
      life: 20,
      maxLife: 20,
    });

    // Create explosion debris & smoke particles
    this.createExplosionParticles(expX, expY);

    // Damage enemies
    room.enemies.forEach((enemy, idx) => {
      const eCenterX = enemy.x + enemy.w / 2;
      const eCenterY = enemy.y + enemy.h / 2;
      const dist = Math.hypot(expX - eCenterX, expY - eCenterY);

      if (dist < bomb.radius + 14) {
        enemy.hp -= 4; // Massive blast damage
        enemy.invulnerableTimer = 25;
        this.createSparkleRing(eCenterX, eCenterY, '#ea580c', 12);

        if (enemy.hp <= 0) {
          this.handleEnemyDefeat(enemy, idx, room);
        }
      }
    });

    // Damage Player if in blast radius
    const pCenterX = this.player.x + 12;
    const pCenterY = this.player.y + 12;
    const pDist = Math.hypot(expX - pCenterX, expY - pCenterY);

    if (pDist < bomb.radius && this.player.invincibleTimer === 0) {
      this.player.hp -= 1;
      this.player.invincibleTimer = 60;
      this.stats.damageTaken += 1;
      audioEngine.hit();
      const angle = Math.atan2(pCenterY - expY, pCenterX - expX);
      this.player.x += Math.cos(angle) * 30;
      this.player.y += Math.sin(angle) * 30;
    }

    // Shatter nearby pots
    for (let i = room.pots.length - 1; i >= 0; i--) {
      const pot = room.pots[i];
      const potX = pot.x * TILE + 20;
      const potY = pot.y * TILE + 20;
      if (Math.hypot(expX - potX, expY - potY) < bomb.radius + 16) {
        const removed = room.pots.splice(i, 1)[0];
        this.stats.potsBroken++;
        this.createClayShards(potX, potY);
        if (removed.contains === 'heart') this.spawnDropItem(potX, potY, 'heart');
        else if (removed.contains === 'rupee_green') this.spawnDropItem(potX, potY, 'rupee_green');
        else if (removed.contains === 'bomb') this.spawnDropItem(potX, potY, 'bomb');
      }
    }

    // Check cracked walls in blast zone!
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (room.map[r][c] === 7) {
          const tileCenterX = c * TILE + 20;
          const tileCenterY = r * TILE + 20;
          const dist = Math.hypot(expX - tileCenterX, expY - tileCenterY);

          if (dist < bomb.radius + 20) {
            this.destroyCrackedWall(room, c, r);
          }
        }
      }
    }
  }

  public destroyCrackedWall(room: RoomData, col: number, row: number): void {
    if (room.map[row][col] !== 7) return;

    // Blow open all adjacent connected cracked wall tiles to form a grand doorway
    for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
        if (room.map[r][c] === 7) {
          room.map[r][c] = 4; // Open passage!
        }
      }
    }

    audioEngine.wallCrumble();
    audioEngine.secret();
    this.player.secretRoomsFound++;
    this.stats.secretRoomsFound++;
    this.addScore(500, col * TILE + 20, row * TILE + 20, '發現隱藏密道!');
    this.showMessage('轟隆！炸碎了有裂隙的厚重石壁，發現隱藏秘室通道！', 220);

    // Stone rubble burst particles
    const wallX = col * TILE + 20;
    const wallY = row * TILE + 20;
    this.createStoneRubble(wallX, wallY);
    this.createSparkleRing(wallX, wallY, '#38bdf8', 24);
  }

  private triggerSwordDamage(room: RoomData): void {
    const slashRect = { x: this.player.x, y: this.player.y, w: 24, h: 24 };
    if (this.player.dir === DIR.UP) {
      slashRect.y -= 26;
      slashRect.w = 34;
      slashRect.x -= 5;
    } else if (this.player.dir === DIR.DOWN) {
      slashRect.y += 26;
      slashRect.w = 34;
      slashRect.x -= 5;
    } else if (this.player.dir === DIR.LEFT) {
      slashRect.x -= 26;
      slashRect.h = 34;
      slashRect.y -= 5;
    } else if (this.player.dir === DIR.RIGHT) {
      slashRect.x += 26;
      slashRect.h = 34;
      slashRect.y -= 5;
    }

    room.enemies.forEach((enemy, idx) => {
      const eRect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      if (this.checkRectOverlap(slashRect, eRect) && enemy.invulnerableTimer === 0) {
        enemy.hp -= 1;
        enemy.invulnerableTimer = 20;
        audioEngine.hit();
        this.createSparkleRing(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ffffff', 8);

        if (this.player.dir === DIR.UP) enemy.y -= 22;
        if (this.player.dir === DIR.DOWN) enemy.y += 22;
        if (this.player.dir === DIR.LEFT) enemy.x -= 22;
        if (this.player.dir === DIR.RIGHT) enemy.x += 22;

        if (enemy.hp <= 0) {
          this.handleEnemyDefeat(enemy, idx, room);
        }
      }
    });
  }

  private triggerSpinAttackDamage(room: RoomData): void {
    const pCenterX = this.player.x + 12;
    const pCenterY = this.player.y + 12;

    // Check cracked walls in spin radius
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (room.map[r][c] === 7) {
          const tileCenterX = c * TILE + 20;
          const tileCenterY = r * TILE + 20;
          if (Math.hypot(pCenterX - tileCenterX, pCenterY - tileCenterY) < 56) {
            this.destroyCrackedWall(room, c, r);
          }
        }
      }
    }

    room.enemies.forEach((enemy, idx) => {
      const eCenterX = enemy.x + enemy.w / 2;
      const eCenterY = enemy.y + enemy.h / 2;
      const dist = Math.hypot(pCenterX - eCenterX, pCenterY - eCenterY);

      if (dist < 52 && enemy.invulnerableTimer === 0) {
        enemy.hp -= 2;
        enemy.invulnerableTimer = 25;
        audioEngine.hit();
        this.createSparkleRing(eCenterX, eCenterY, '#facc15', 12);

        const angle = Math.atan2(eCenterY - pCenterY, eCenterX - pCenterX);
        enemy.x += Math.cos(angle) * 36;
        enemy.y += Math.sin(angle) * 36;

        if (enemy.hp <= 0) {
          this.handleEnemyDefeat(enemy, idx, room);
        }
      }
    });
  }

  private handleEnemyDefeat(enemy: Enemy, index: number, room: RoomData): void {
    room.enemies.splice(index, 1);
    this.stats.enemiesDefeated++;
    audioEngine.enemyDefeat();

    let killPoints = 100;
    if (enemy.type === 'bat') killPoints = 50;
    if (enemy.type === 'knight') killPoints = 1000;

    this.addScore(killPoints, enemy.x + enemy.w / 2, enemy.y, `擊倒${enemy.type === 'knight' ? '黑鐵騎士!' : '魔物!'}`);
    this.createSparkleRing(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#fbbf24', 16);

    if (enemy.type === 'knight') {
      this.showMessage('黑鐵騎士被擊敗了！三神力寶箱現世！', 180);
      this.spawnDropItem(enemy.x + 12, enemy.y + 12, 'rupee_red');
      this.spawnDropItem(enemy.x - 8, enemy.y + 12, 'heart');
      this.spawnDropItem(enemy.x + 24, enemy.y + 12, 'bomb');
    } else {
      const dropRoll = Math.random();
      if (dropRoll < 0.25) {
        this.spawnDropItem(enemy.x + 6, enemy.y + 6, 'heart');
      } else if (dropRoll < 0.5) {
        this.spawnDropItem(enemy.x + 6, enemy.y + 6, 'bomb');
      } else if (dropRoll < 0.8) {
        this.spawnDropItem(enemy.x + 6, enemy.y + 6, 'rupee_green');
      } else {
        this.spawnDropItem(enemy.x + 6, enemy.y + 6, 'rupee_blue');
      }
    }
  }

  private checkRoomTransition(): void {
    const [rx, ry] = this.curRoomKey.split(',').map(Number);
    const canvasWidth = COLS * TILE;
    const canvasHeight = ROWS * TILE;

    // Moving Right (East)
    if (this.player.x > canvasWidth - 24) {
      const nextKey = `${rx + 1},${ry}`;
      if (this.rooms[nextKey]) {
        this.curRoomKey = nextKey;
        this.player.x = 24;
        this.showMessage(`進入：${this.rooms[nextKey].name}`, 120);
      } else {
        this.player.x = canvasWidth - 25;
      }
    }
    // Moving Left (West)
    else if (this.player.x < 10) {
      const nextKey = `${rx - 1},${ry}`;
      if (this.rooms[nextKey]) {
        this.curRoomKey = nextKey;
        this.player.x = canvasWidth - 36;
        this.showMessage(`進入：${this.rooms[nextKey].name}`, 120);
      } else {
        this.player.x = 11;
      }
    }
    // Moving Up (North)
    else if (this.player.y < 12) {
      const curRoom = this.rooms[this.curRoomKey];
      const pCol = Math.floor((this.player.x + 12) / TILE);

      // Check if entering secret room '-1,-1' from '-1,0' at col 2-3
      if (this.curRoomKey === '-1,0' && (pCol === 2 || pCol === 3)) {
        if (curRoom.map[0][pCol] === 4) {
          this.curRoomKey = '-1,-1';
          this.player.y = canvasHeight - 48;
          this.showMessage(`發現隱藏房間：${this.rooms['-1,-1'].name}！`, 160);
          return;
        } else if (curRoom.map[0][pCol] === 7) {
          this.showMessage('這面石壁佈滿了細微裂縫... 似乎可以用炸彈炸開！', 140);
          this.player.y = 14;
          return;
        }
      }

      // Check if entering secret room '1,-1' from '1,0' at col 12-13
      if (this.curRoomKey === '1,0' && (pCol === 12 || pCol === 13)) {
        if (curRoom.map[0][pCol] === 4) {
          this.curRoomKey = '1,-1';
          this.player.y = canvasHeight - 48;
          this.showMessage(`發現隱藏房間：${this.rooms['1,-1'].name}！`, 160);
          return;
        } else if (curRoom.map[0][pCol] === 7) {
          this.showMessage('這面石壁佈滿了細微裂縫... 似乎可以用炸彈炸開！', 140);
          this.player.y = 14;
          return;
        }
      }

      // Check locked door at north (col 7-8)
      if (curRoom.map[0][7] === 3 || curRoom.map[0][8] === 3) {
        if (this.player.keys > 0) {
          this.player.keys--;
          curRoom.map[0][7] = 4;
          curRoom.map[0][8] = 4;
          audioEngine.secret();
          this.addScore(150, 7.5 * TILE + 20, 20, '解鎖大門');
          this.showMessage('消耗了一把【小鑰匙】，鎖住的大門被打開了！', 160);
          this.createSparkleRing(7.5 * TILE + 20, 20, '#fbbf24', 18);
        } else {
          this.showMessage('這扇鐵門被牢牢鎖住了！需要在牢房尋找【小鑰匙】。', 120);
          this.player.y = 14;
          return;
        }
      }

      const nextKey = `${rx},${ry - 1}`;
      if (this.rooms[nextKey]) {
        this.curRoomKey = nextKey;
        this.player.y = canvasHeight - 48;
        this.showMessage(`進入：${this.rooms[nextKey].name}`, 120);
      } else {
        this.player.y = 13;
      }
    }
    // Moving Down (South)
    else if (this.player.y > canvasHeight - 28) {
      // Check exiting secret rooms back to -1,0 or 1,0
      if (this.curRoomKey === '-1,-1') {
        this.curRoomKey = '-1,0';
        this.player.y = 20;
        this.player.x = 2.5 * TILE;
        this.showMessage(`回到：${this.rooms['-1,0'].name}`, 120);
        return;
      }
      if (this.curRoomKey === '1,-1') {
        this.curRoomKey = '1,0';
        this.player.y = 20;
        this.player.x = 12.5 * TILE;
        this.showMessage(`回到：${this.rooms['1,0'].name}`, 120);
        return;
      }

      const nextKey = `${rx},${ry + 1}`;
      if (this.rooms[nextKey]) {
        this.curRoomKey = nextKey;
        this.player.y = 20;
        this.showMessage(`進入：${this.rooms[nextKey].name}`, 120);
      } else {
        this.player.y = canvasHeight - 29;
      }
    }
  }

  public isSolid(x: number, y: number, room: RoomData): boolean {
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;

    const tile = room.map[row][col];
    if (tile === 1 || tile === 6 || tile === 7) return true; // Wall, Pillar, or Cracked Wall
    if (tile === 3) return true; // Locked Door
    if (tile === 5) return true; // Fairy spring water pool

    for (const pot of room.pots) {
      if (pot.x === col && pot.y === row) return true;
    }

    for (const block of room.blocks) {
      if (Math.round(block.x) === col && Math.round(block.y) === row) return true;
    }

    for (const chest of room.chests) {
      if (Math.floor(chest.x) === col && Math.floor(chest.y) === row) return true;
    }

    return false;
  }

  private checkRectOverlap(r1: { x: number; y: number; w: number; h: number }, r2: { x: number; y: number; w: number; h: number }): boolean {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
  }

  public spawnDropItem(x: number, y: number, type: 'heart' | 'rupee_green' | 'rupee_blue' | 'rupee_red' | 'bomb'): void {
    this.dropItems.push({
      id: Math.random().toString(),
      x,
      y,
      type,
      life: 600,
      bounceOffset: Math.random() * Math.PI * 2,
    });
  }

  public createClayShards(x: number, y: number): void {
    const colors = ['#c2410c', '#ea580c', '#9a3412', '#fdba74'];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 18 + Math.random() * 12,
        maxLife: 30,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 2,
      });
    }
  }

  public createStoneRubble(x: number, y: number): void {
    const colors = ['#475569', '#64748b', '#334155', '#94a3b8'];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = 2 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 3,
      });
    }
  }

  public createExplosionParticles(x: number, y: number): void {
    const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff', '#475569'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 18 + Math.random() * 12,
        maxLife: 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 3,
      });
    }
  }

  public createSparkleRing(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 14 + Math.random() * 10,
        maxLife: 24,
        color,
        size: 3,
      });
    }
  }

  public createDustPuff(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.6 - Math.random() * 0.8,
        life: 12 + Math.random() * 8,
        maxLife: 20,
        color: 'rgba(203, 213, 225, 0.6)',
        size: 3,
      });
    }
  }
}
