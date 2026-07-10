import {Direction, GameMove, GameState, GridCoord, HintSuggestion, LevelDefinition, TileType} from '../types';
import {computeMove} from './MovementEngine';
import {WinEngine} from './WinEngine';
import {buildRuntimeGrid, cloneGrid, coordsEqual, countPaintable, countPainted} from '../utils/gridUtils';

const ALL_DIRECTIONS = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];

/**
 * Pure, side-effect-free game logic. Every method takes the current
 * GameState (or a LevelDefinition to start one) and returns a brand new
 * state — screens/stores never mutate a GameState in place.
 */
export const GameEngine = {
  createInitialState(level: LevelDefinition): GameState {
    const grid = buildRuntimeGrid(level);
    const ballPosition: GridCoord = {...level.ballStart};
    const startTile = grid[ballPosition.row][ballPosition.col];
    if (startTile.paintable) {
      startTile.painted = true;
    }

    return {
      levelId: level.id,
      grid,
      ballPosition,
      status: 'playing',
      moveCount: 0,
      elapsedMs: 0,
      history: [],
      paintedCount: countPainted(grid),
      paintableTotal: countPaintable(grid),
      hintsUsed: 0,
    };
  },

  restart(level: LevelDefinition): GameState {
    return this.createInitialState(level);
  },

  move(state: GameState, direction: Direction): GameState {
    if (state.status !== 'playing') {
      return state;
    }

    const result = computeMove(state.grid, state.ballPosition, direction);
    if (!result.moved) {
      return state;
    }

    const grid = cloneGrid(state.grid);
    const newlyPainted: GridCoord[] = [];
    for (const coord of result.path) {
      const tile = grid[coord.row][coord.col];
      if (tile.paintable && !tile.painted) {
        tile.painted = true;
        newlyPainted.push({row: coord.row, col: coord.col});
      }
    }

    const move: GameMove = {
      direction,
      from: state.ballPosition,
      to: result.finalPosition,
      path: result.path,
      newlyPainted,
    };

    const won = WinEngine.isComplete(grid);

    return {
      ...state,
      grid,
      ballPosition: result.finalPosition,
      moveCount: state.moveCount + 1,
      history: [...state.history, move],
      paintedCount: state.paintedCount + newlyPainted.length,
      status: won ? 'won' : state.status,
    };
  },

  undo(state: GameState): GameState {
    if (state.history.length === 0 || state.status === 'won' || state.status === 'lost') {
      return state;
    }
    const lastMove = state.history[state.history.length - 1];
    const grid = cloneGrid(state.grid);
    for (const coord of lastMove.newlyPainted) {
      grid[coord.row][coord.col].painted = false;
    }

    return {
      ...state,
      grid,
      ballPosition: lastMove.from,
      moveCount: Math.max(0, state.moveCount - 1),
      history: state.history.slice(0, -1),
      paintedCount: state.paintedCount - lastMove.newlyPainted.length,
      status: 'playing',
    };
  },

  pause(state: GameState): GameState {
    return state.status === 'playing' ? {...state, status: 'paused'} : state;
  },

  resume(state: GameState): GameState {
    return state.status === 'paused' ? {...state, status: 'playing'} : state;
  },

  tick(state: GameState, deltaMs: number): GameState {
    if (state.status !== 'playing') {
      return state;
    }
    return {...state, elapsedMs: state.elapsedMs + deltaMs};
  },

  /** Unlocks a LOCKED tile in place. Caller is responsible for validating/charging the star cost first. */
  unlockTile(state: GameState, coord: GridCoord): GameState {
    const tile = state.grid[coord.row][coord.col];
    if (tile.type !== TileType.Locked) {
      return state;
    }
    const grid = cloneGrid(state.grid);
    const target = grid[coord.row][coord.col];
    target.type = TileType.Empty;
    target.paintable = true;

    return {
      ...state,
      grid,
      paintableTotal: state.paintableTotal + 1,
    };
  },

  /**
   * Greedy hint: tries every direction and suggests whichever paints the
   * most new tiles right now. Returns null if the ball is fully stuck
   * (no direction moves it at all).
   */
  getHint(state: GameState): HintSuggestion | null {
    let best: HintSuggestion | null = null;

    for (const direction of ALL_DIRECTIONS) {
      const result = computeMove(state.grid, state.ballPosition, direction);
      if (!result.moved) {
        continue;
      }
      let newlyPaintedCount = 0;
      for (const coord of result.path) {
        const tile = state.grid[coord.row][coord.col];
        if (tile.paintable && !tile.painted) {
          newlyPaintedCount++;
        }
      }
      if (!best || newlyPaintedCount > best.newlyPaintedCount) {
        best = {direction, newlyPaintedCount};
      }
    }

    return best;
  },

  isBallAt(state: GameState, coord: GridCoord): boolean {
    return coordsEqual(state.ballPosition, coord);
  },
};
