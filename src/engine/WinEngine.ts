import {LevelTile, StarRatingResult} from '../types';

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
