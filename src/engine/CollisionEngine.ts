import {GridCoord, LevelTile, TileType} from '../types';
import {isInBounds} from '../utils/gridUtils';

const BLOCKING_TYPES: ReadonlySet<TileType> = new Set([
  TileType.Wall,
  TileType.Obstacle,
  TileType.Void,
  TileType.Locked,
]);

/**
 * Pure collision rules for the rolling ball. A tile blocks entry if it's a
 * wall/obstacle/void, a still-locked tile, or simply off the grid.
 */
export const CollisionEngine = {
  isBlocking(tile: LevelTile): boolean {
    return BLOCKING_TYPES.has(tile.type);
  },

  canEnter(grid: LevelTile[][], coord: GridCoord): boolean {
    if (!isInBounds(grid.length, grid[0].length, coord)) {
      return false;
    }
    return !this.isBlocking(grid[coord.row][coord.col]);
  },

  /** Ice never stops the ball — it slides straight through. */
  isSlippery(tile: LevelTile): boolean {
    return tile.type === TileType.Ice;
  },

  isPortal(tile: LevelTile): boolean {
    return tile.type === TileType.Portal;
  },
};
