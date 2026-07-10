export const GameConfig = {
  /** Base coin reward multiplier applied on top of a level's own reward. */
  DAILY_CHALLENGE_COIN_REWARD: 50,
  HINT_COIN_COST: 15,
  UNDO_LIMIT_PER_LEVEL: 20,
  MAX_HINTS_PER_LEVEL: 3,
  STARTING_COINS: 100,
  TILE_GAP: 3,
  GRID_PADDING: 12,
  BALL_MOVE_MS_PER_TILE: 90,
  PAINT_SPLASH_DURATION_MS: 260,
} as const;

export const AdConfig = {
  /** Show an interstitial after this many level completions. */
  INTERSTITIAL_EVERY_N_LEVELS: 3,
  REWARDED_HINT_MULTIPLIER: 3,
} as const;
