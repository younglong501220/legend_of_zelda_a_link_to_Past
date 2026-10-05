/**
 * Zelda A Link to the Past tribute game types
 */

export type Direction = 0 | 1 | 2 | 3; // 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT

export const DIR = {
  UP: 0 as Direction,
  RIGHT: 1 as Direction,
  DOWN: 2 as Direction,
  LEFT: 3 as Direction,
};

export type GameState = 'PLAY' | 'GAMEOVER' | 'VICTORY' | 'PAUSED';

export interface Bomb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
  maxTimer: number;
  radius: number;
}

export interface BombExplosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  dir: Direction;
  maxHp: number; // in half-hearts (e.g. 6 = 3 full hearts, 8 = 4 hearts)
  hp: number;
  keys: number;
  rupees: number;
  bombs: number;
  maxBombs: number;
  score: number;
  secretRoomsFound: number;
  hasTriforce: boolean;
  hasGlove: boolean;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  isSpinAttacking: boolean;
  spinCharge: number;
  spinAngle: number;
  heldPot: boolean;
  invincibleTimer: number;
  walkFrame: number;
  walkCounter: number;
}

export type EnemyType = 'soldier' | 'bat' | 'knight' | 'soldier_blue';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Direction;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  speed: number;
  stateTimer: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt';
  invulnerableTimer: number;
}

export interface Pot {
  id: string;
  x: number; // grid col
  y: number; // grid row
  contains?: 'heart' | 'rupee_green' | 'rupee_blue' | 'rupee_red' | 'bomb' | 'none';
}

export interface FlyingPot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface PushBlock {
  id: string;
  x: number; // floating tile coordinate
  y: number;
  originalX: number;
  originalY: number;
}

export interface SwitchPlate {
  id: string;
  x: number; // tile col
  y: number; // tile row
  pressed: boolean;
  color?: string;
  targetDoor?: { room: string; x: number; y: number };
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  item: 'key' | 'triforce' | 'heart_container' | 'rupees_50' | 'bombs_pack';
}

export interface DropItem {
  id: string;
  x: number;
  y: number;
  type: 'heart' | 'rupee_green' | 'rupee_blue' | 'rupee_red' | 'bomb';
  life: number;
  bounceOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Torch {
  x: number; // tile col
  y: number; // tile row
  flameCycle: number;
}

export interface CrackedWall {
  id: string;
  col: number;
  row: number;
  hp: number;
  destroyed: boolean;
  targetRoom: string;
}

export interface RoomData {
  id: string;
  name: string;
  subtitle: string;
  map: number[][]; // 0: empty, 1: wall, 2: passage, 3: locked door, 4: unlocked door, 5: water/chasm, 6: decorative pillar, 7: cracked wall
  doorLocked?: boolean;
  pots: Pot[];
  blocks: PushBlock[];
  switches: SwitchPlate[];
  chests: Chest[];
  enemies: Enemy[];
  torches: Torch[];
  crackedWalls?: CrackedWall[];
  floorStyle?: 'dungeon' | 'sanctum' | 'vault' | 'fairy_spring';
}

export interface GameStats {
  score: number;
  highScore: number;
  enemiesDefeated: number;
  potsBroken: number;
  rupeesCollected: number;
  damageTaken: number;
  secretRoomsFound: number;
  bombsUsed: number;
  startTime: number;
  finishTime?: number;
  rank?: 'S' | 'A' | 'B' | 'C';
}
