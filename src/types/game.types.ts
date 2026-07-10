/** Swipe / movement direction on the grid. */
export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

/**
 * What a single grid cell is structurally. This does NOT encode paint
 * state — a tile keeps its type for the whole game (e.g. an Ice tile is
 * always Ice), except LOCKED, which becomes EMPTY once unlocked. Paint
 * state is tracked separately via `LevelTile.painted` so tiles like Ice
 * and Teleport can be both "paintable" and keep their special movement
 * behavior after being visited.
 */
export enum TileType {
  /** Rollable, paintable floor. */
  Empty = 'EMPTY',
  /** Solid wall — blocks movement, ball stops before it. */
  Wall = 'WALL',
  /** Non-paintable decorative/blocking obstacle. */
  Obstacle = 'OBSTACLE',
  /** Outside the playable grid. */
  Void = 'VOID',
  /** Blocks movement until unlocked with stars; becomes EMPTY once unlocked. */
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
  /** Whether this tile must be painted to win (false for WALL/OBSTACLE/VOID/PORTAL). */
  paintable: boolean;
  /** Runtime paint state. Always false in static level JSON. */
  painted: boolean;
  /** For LOCKED tiles: coin cost to unlock (tap to pay, then it's rollable). */
  unlockCost?: number;
  /** For PORTAL/TELEPORT pairs: id linking a portal to its exit. */
  linkId?: string;
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
  from: GridCoord;
  to: GridCoord;
  /** Every tile the ball passed over during this move, in order. */
  path: GridCoord[];
  /** Tiles that were painted for the first time on this move (undo target). */
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

export interface HintSuggestion {
  direction: Direction;
  newlyPaintedCount: number;
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
