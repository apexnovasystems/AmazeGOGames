import {create} from 'zustand';
import {Direction, GameState, GridCoord, HintSuggestion, LevelDefinition, TileType} from '../types';
import {GameEngine} from '../engine/GameEngine';
import {WinEngine} from '../engine/WinEngine';
import {LevelLoader} from '../engine/LevelLoader';
import {useProgressStore} from './useProgressStore';
import {useStatsStore} from './useStatsStore';
import {useAchievementsStore} from './useAchievementsStore';
import {useDailyChallengeStore} from './useDailyChallengeStore';
import {AdConfig, GameConfig} from '../constants/gameConfig';
import {SoundService} from '../services/SoundService';

interface GameStoreState {
  level: LevelDefinition | null;
  gameState: GameState | null;
  hint: HintSuggestion | null;
  isDaily: boolean;
  /** Extra hint uses granted this level session by watching a rewarded ad. */
  bonusHints: number;

  loadLevel: (levelId: string, options?: {isDaily?: boolean}) => void;
  move: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  tick: (deltaMs: number) => void;
  requestHint: () => boolean;
  clearHint: () => void;
  unlockTile: (coord: GridCoord) => boolean;
  grantBonusHints: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  level: null,
  gameState: null,
  hint: null,
  isDaily: false,
  bonusHints: 0,

  loadLevel: (levelId, options) => {
    const level = LevelLoader.getLevelById(levelId);
    if (!level) {
      return;
    }
    set({
      level,
      gameState: GameEngine.createInitialState(level),
      hint: null,
      isDaily: Boolean(options?.isDaily),
      bonusHints: 0,
    });
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
    useStatsStore.getState().recordMove();

    if (next.status === 'won') {
      SoundService.play('victory');
      const result = WinEngine.rateStars(next.moveCount, level.starThresholds);
      const progress = useProgressStore.getState();
      const firstClear = !progress.getLevelProgress(level.id)?.completed;
      progress.recordLevelResult(level.id, result, next.elapsedMs);
      progress.addCoins(level.coinsReward);
      useStatsStore.getState().recordLevelResult({
        timeMs: next.elapsedMs,
        won: true,
        stars: result.stars,
        firstClear,
      });
      const nextLevel = LevelLoader.getNextLevel(level.id);
      if (nextLevel) {
        progress.unlockLevel(nextLevel.id);
      }
      if (get().isDaily) {
        useDailyChallengeStore.getState().completeToday();
      }
      useAchievementsStore.getState().evaluate();
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
    set({gameState: GameEngine.restart(level), hint: null, bonusHints: 0});
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
      useStatsStore.getState().recordLevelResult({timeMs: timeLimitMs, won: false, stars: 0, firstClear: false});
      set({gameState: {...next, elapsedMs: timeLimitMs, status: 'lost'}});
      return;
    }
    set({gameState: next});
  },

  requestHint: () => {
    const {gameState, bonusHints} = get();
    if (!gameState || gameState.status !== 'playing') {
      return false;
    }
    if (gameState.hintsUsed >= GameConfig.MAX_HINTS_PER_LEVEL + bonusHints) {
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

  grantBonusHints: () => {
    set({bonusHints: get().bonusHints + GameConfig.MAX_HINTS_PER_LEVEL * (AdConfig.REWARDED_HINT_MULTIPLIER - 1)});
  },

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
