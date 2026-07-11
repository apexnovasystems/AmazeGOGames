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
  /** Max speed-bonus coins on a timed level, as a fraction of its base reward (finishing instantly = full bonus). */
  TIME_BONUS_MAX_FRACTION: 0.5,
} as const;

export const AdConfig = {
  /** Show an interstitial after this many level completions. */
  INTERSTITIAL_EVERY_N_LEVELS: 3,
  REWARDED_HINT_MULTIPLIER: 3,
} as const;
