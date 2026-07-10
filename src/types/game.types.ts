/** Swipe / movement direction on the grid. */
export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

/** What a single grid cell is made of. */
export enum TileType {
  /** Rollable floor that has not been painted yet. */
  Empty = 'EMPTY',
  /** Rollable floor that the ball has already painted. */
  Painted = 'PAINTED',
  /** Solid wall — blocks movement, ball stops before it. */
  Wall = 'WALL',
  /** Non-paintable decorative/blocking obstacle. */
  Obstacle = 'OBSTACLE',
  /** Outside the playable grid. */
  Void = 'VOID',
  /** Requires a key/star count to unlock before it can be painted. */
  Locked = 'LOCKED',
  /** Ball slides through without stopping (until it hits something else). */
  Ice = 'ICE',
  /** Sends the ball to the linked teleport tile, preserving direction. */
  Portal = 'PORTAL',
  /** Landing side of a portal pair. */
  Teleport = 'TELEPORT',
}

export interface GridCoord {
  row: number;
  col: number;
}

export interface LevelTile {
  row: number;
  col: number;
  type: TileType;
  /** For LOCKED tiles: number of stars required to unlock. */
  unlockCost?: number;
  /** For PORTAL/TELEPORT pairs: id linking a portal to its exit. */
  linkId?: string;
  /** Whether this tile must be painted to win (false for WALL/OBSTACLE/VOID/LOCKED-permanently). */
  paintable: boolean;
}

export interface LevelDefinition {
  id: string;
  /** Sequential index used for ordering / unlock progression. */
  order: number;
  name: string;
  rows: number;
  cols: number;
  ballStart: GridCoord;
  tiles: LevelTile[];
  /** Move counts used to award 1/2/3 stars. Ascending, e.g. [12, 9, 6]. */
  starThresholds: [number, number, number];
  /** Optional par time in seconds for time-based bonus (0 = untimed). */
  parTimeSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  coinsReward: number;
  /** Coin cost to unlock this level if not reached via progression. */
  unlockCoinCost?: number;
}

export interface LevelPack {
  packId: string;
  packName: string;
  levels: LevelDefinition[];
}

/** Serializable move used by the undo stack. */
export interface GameMove {
  direction: Direction;
  path: GridCoord[];
  /** Tiles that were painted for the first time on this move. */
  newlyPainted: GridCoord[];
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'paused';

export interface GameState {
  levelId: string;
  grid: LevelTile[][];
  ballPosition: GridCoord;
  status: GameStatus;
  moveCount: number;
  elapsedMs: number;
  history: GameMove[];
  paintedCount: number;
  paintableTotal: number;
  hintsUsed: number;
}

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestMoves: number | null;
  bestTimeMs: number | null;
  unlocked: boolean;
}

export interface StarRatingResult {
  stars: 0 | 1 | 2 | 3;
  moveCount: number;
}
