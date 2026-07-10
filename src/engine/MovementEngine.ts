import {Direction, GridCoord, LevelTile} from '../types';
import {CollisionEngine} from './CollisionEngine';
import {DIRECTION_DELTA, findLinkedTile, getTile} from '../utils/gridUtils';

export interface MovementResult {
  /** Every tile the ball actually entered, in order (excludes the start tile). */
  path: GridCoord[];
  /** Where the ball ends up. Equal to the start position if the move was a no-op. */
  finalPosition: GridCoord;
  /** True if the ball moved at least one tile. */
  moved: boolean;
}

/** Safety cap so a malformed portal loop in level data can never hang the engine. */
const MAX_STEPS = 500;

/**
 * Rolls the ball from `start` in `direction` until it hits a wall,
 * obstacle, locked tile, or the grid boundary — the core "roll until
 * blocked" mechanic. Ice tiles are passed through without stopping.
 * Portals teleport the ball to their linked tile and movement continues
 * from there in the same direction.
 */
export function computeMove(grid: LevelTile[][], start: GridCoord, direction: Direction): MovementResult {
  const delta = DIRECTION_DELTA[direction];
  const path: GridCoord[] = [];
  let current = start;
  let steps = 0;

  while (steps++ < MAX_STEPS) {
    const next: GridCoord = {row: current.row + delta.row, col: current.col + delta.col};

    if (!CollisionEngine.canEnter(grid, next)) {
      break;
    }

    const nextTile = getTile(grid, next);

    if (CollisionEngine.isPortal(nextTile)) {
      // Portal tiles are transit-only: they don't get added to the path,
      // the ball just re-emerges at the linked tile and keeps rolling.
      const exit = nextTile.linkId ? findLinkedTile(grid, nextTile.linkId, next) : null;
      if (!exit) {
        break;
      }
      current = {row: exit.row, col: exit.col};
      path.push(current);
      continue;
    }

    current = next;
    path.push(current);
  }

  return {
    path,
    finalPosition: path.length > 0 ? path[path.length - 1] : start,
    moved: path.length > 0,
  };
}
