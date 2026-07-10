import {create} from 'zustand';
import {Direction, GameState, GridCoord, HintSuggestion, LevelDefinition, TileType} from '../types';
import {GameEngine} from '../engine/GameEngine';
import {WinEngine} from '../engine/WinEngine';
import {LevelLoader} from '../engine/LevelLoader';
import {useProgressStore} from './useProgressStore';
import {GameConfig} from '../constants/gameConfig';
import {SoundService} from '../services/SoundService';

interface GameStoreState {
  level: LevelDefinition | null;
  gameState: GameState | null;
  hint: HintSuggestion | null;

  loadLevel: (levelId: string) => void;
  move: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  tick: (deltaMs: number) => void;
  requestHint: () => boolean;
  clearHint: () => void;
  unlockTile: (coord: GridCoord) => boolean;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  level: null,
  gameState: null,
  hint: null,

  loadLevel: levelId => {
    const level = LevelLoader.getLevelById(levelId);
    if (!level) {
      return;
    }
    set({level, gameState: GameEngine.createInitialState(level), hint: null});
  },

  move: direction => {
    const {gameState, level} = get();
    if (!gameState || !level) {
      return;
    }
    const next = GameEngine.move(gameState, direction);
    if (next === gameState) {
      return;
    }
    set({gameState: next, hint: null});

    if (next.status === 'won') {
      SoundService.play('victory');
      const result = WinEngine.rateStars(next.moveCount, level.starThresholds);
      const progress = useProgressStore.getState();
      progress.recordLevelResult(level.id, result, next.elapsedMs);
      progress.addCoins(level.coinsReward);
      const nextLevel = LevelLoader.getNextLevel(level.id);
      if (nextLevel) {
        progress.unlockLevel(nextLevel.id);
      }
    }
  },

  undo: () => {
    const {gameState} = get();
    if (!gameState) {
      return;
    }
    set({gameState: GameEngine.undo(gameState), hint: null});
  },

  restart: () => {
    const {level} = get();
    if (!level) {
      return;
    }
    set({gameState: GameEngine.restart(level), hint: null});
  },

  pause: () => {
    const {gameState} = get();
    if (!gameState) {
      return;
    }
    set({gameState: GameEngine.pause(gameState)});
  },

  resume: () => {
    const {gameState} = get();
    if (!gameState) {
      return;
    }
    set({gameState: GameEngine.resume(gameState)});
  },

  tick: deltaMs => {
    const {gameState, level} = get();
    if (!gameState || gameState.status !== 'playing') {
      return;
    }
    const next = GameEngine.tick(gameState, deltaMs);
    const timeLimitMs = (level?.parTimeSeconds ?? 0) * 1000;

    if (timeLimitMs > 0 && next.elapsedMs >= timeLimitMs) {
      SoundService.play('fail');
      set({gameState: {...next, elapsedMs: timeLimitMs, status: 'lost'}});
      return;
    }
    set({gameState: next});
  },

  requestHint: () => {
    const {gameState} = get();
    if (!gameState || gameState.status !== 'playing') {
      return false;
    }
    if (gameState.hintsUsed >= GameConfig.MAX_HINTS_PER_LEVEL) {
      return false;
    }
    const spent = useProgressStore.getState().spendCoins(GameConfig.HINT_COIN_COST);
    if (!spent) {
      return false;
    }
    const hint = GameEngine.getHint(gameState);
    set({gameState: {...gameState, hintsUsed: gameState.hintsUsed + 1}, hint});
    return true;
  },

  clearHint: () => set({hint: null}),

  unlockTile: coord => {
    const {gameState} = get();
    if (!gameState || gameState.status !== 'playing') {
      return false;
    }
    const tile = gameState.grid[coord.row][coord.col];
    if (tile.type !== TileType.Locked || !tile.unlockCost) {
      return false;
    }
    const spent = useProgressStore.getState().spendCoins(tile.unlockCost);
    if (!spent) {
      return false;
    }
    SoundService.play('unlock');
    set({gameState: GameEngine.unlockTile(gameState, coord)});
    return true;
  },
}));
