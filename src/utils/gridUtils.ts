import {Direction, GridCoord, LevelDefinition, LevelTile} from '../types';

/** Row/column delta for a single step in a given direction. */
export const DIRECTION_DELTA: Record<Direction, GridCoord> = {
  [Direction.Up]: {row: -1, col: 0},
  [Direction.Down]: {row: 1, col: 0},
  [Direction.Left]: {row: 0, col: -1},
  [Direction.Right]: {row: 0, col: 1},
};

export function coordsEqual(a: GridCoord, b: GridCoord): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isInBounds(rows: number, cols: number, coord: GridCoord): boolean {
  return coord.row >= 0 && coord.row < rows && coord.col >= 0 && coord.col < cols;
}

export function getTile(grid: LevelTile[][], coord: GridCoord): LevelTile {
  return grid[coord.row][coord.col];
}

/** Deep clone so engine mutations never touch the original level definition or previous state. */
export function cloneGrid(grid: LevelTile[][]): LevelTile[][] {
  return grid.map(row => row.map(tile => ({...tile})));
}

/** Builds the initial 2D runtime grid (rows x cols) from a flat level tile list. */
export function buildRuntimeGrid(level: LevelDefinition): LevelTile[][] {
  const grid: LevelTile[][] = Array.from({length: level.rows}, () => new Array(level.cols));
  for (const tile of level.tiles) {
    grid[tile.row][tile.col] = {...tile, painted: false};
  }
  return grid;
}

export function countPaintable(grid: LevelTile[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.paintable) {
        count++;
      }
    }
  }
  return count;
}

export function countPainted(grid: LevelTile[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.paintable && tile.painted) {
        count++;
      }
    }
  }
  return count;
}

/** Finds the TELEPORT tile linked to a given PORTAL/TELEPORT tile's linkId. */
export function findLinkedTile(grid: LevelTile[][], linkId: string, exclude: GridCoord): LevelTile | null {
  for (const row of grid) {
    for (const tile of row) {
      if (tile.linkId === linkId && !(tile.row === exclude.row && tile.col === exclude.col)) {
        return tile;
      }
    }
  }
  return null;
}
