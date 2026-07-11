import {LevelTile, StarRatingResult} from '../types';
import {GameConfig} from '../constants/gameConfig';

export const WinEngine = {
  isComplete(grid: LevelTile[][]): boolean {
    for (const row of grid) {
      for (const tile of row) {
        if (tile.paintable && !tile.painted) {
          return false;
        }
      }
    }
    return true;
  },

  /**
   * Rewards finishing well under the clock — up to TIME_BONUS_MAX_FRACTION
   * extra coins (as a fraction of the level's base reward) for finishing
   * instantly, scaling down to 0 as the timer runs out. Untimed levels
   * (parTimeSeconds === 0) never award a bonus.
   */
  calculateTimeBonus(elapsedMs: number, parTimeSeconds: number, baseCoinsReward: number): number {
    const timeLimitMs = parTimeSeconds * 1000;
    if (timeLimitMs <= 0) {
      return 0;
    }
    const remainingFraction = Math.max(0, Math.min(1, (timeLimitMs - elapsedMs) / timeLimitMs));
    return Math.round(baseCoinsReward * GameConfig.TIME_BONUS_MAX_FRACTION * remainingFraction);
  },

  /** Fewer moves than the tightest threshold earns 3 stars, and so on down to 0. */
  rateStars(moveCount: number, starThresholds: [number, number, number]): StarRatingResult {
    const [oneStarMax, twoStarMax, threeStarMax] = starThresholds;
    let stars: 0 | 1 | 2 | 3 = 0;
    if (moveCount <= threeStarMax) {
      stars = 3;
    } else if (moveCount <= twoStarMax) {
      stars = 2;
    } else if (moveCount <= oneStarMax) {
      stars = 1;
    }
    return {stars, moveCount};
  },
};
