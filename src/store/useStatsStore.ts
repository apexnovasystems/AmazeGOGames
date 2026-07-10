import {create} from 'zustand';
import {StorageService} from '../services/StorageService';
import {StorageKeys} from '../constants/storageKeys';

interface StatsState {
  totalMoves: number;
  totalPlaytimeMs: number;
  levelsCompleted: number;
  perfectClears: number;
  longestStreak: number;

  recordMove: () => void;
  recordLevelResult: (params: {timeMs: number; won: boolean; stars: 0 | 1 | 2 | 3; firstClear: boolean}) => void;
  recordStreak: (streak: number) => void;
  resetAll: () => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  totalMoves: StorageService.getNumber(StorageKeys.STATS_TOTAL_MOVES, 0),
  totalPlaytimeMs: StorageService.getNumber(StorageKeys.STATS_TOTAL_PLAYTIME_MS, 0),
  levelsCompleted: StorageService.getNumber(StorageKeys.STATS_LEVELS_COMPLETED, 0),
  perfectClears: StorageService.getNumber(StorageKeys.STATS_PERFECT_CLEARS, 0),
  longestStreak: StorageService.getNumber(StorageKeys.STATS_LONGEST_STREAK, 0),

  recordMove: () => {
    const next = get().totalMoves + 1;
    StorageService.setNumber(StorageKeys.STATS_TOTAL_MOVES, next);
    set({totalMoves: next});
  },

  recordLevelResult: ({timeMs, won, stars, firstClear}) => {
    const state = get();
    const totalPlaytimeMs = state.totalPlaytimeMs + timeMs;
    const levelsCompleted = won && firstClear ? state.levelsCompleted + 1 : state.levelsCompleted;
    const perfectClears = won && stars === 3 ? state.perfectClears + 1 : state.perfectClears;

    StorageService.setNumber(StorageKeys.STATS_TOTAL_PLAYTIME_MS, totalPlaytimeMs);
    StorageService.setNumber(StorageKeys.STATS_LEVELS_COMPLETED, levelsCompleted);
    StorageService.setNumber(StorageKeys.STATS_PERFECT_CLEARS, perfectClears);
    set({totalPlaytimeMs, levelsCompleted, perfectClears});
  },

  recordStreak: streak => {
    if (streak <= get().longestStreak) {
      return;
    }
    StorageService.setNumber(StorageKeys.STATS_LONGEST_STREAK, streak);
    set({longestStreak: streak});
  },

  resetAll: () => {
    StorageService.setNumber(StorageKeys.STATS_TOTAL_MOVES, 0);
    StorageService.setNumber(StorageKeys.STATS_TOTAL_PLAYTIME_MS, 0);
    StorageService.setNumber(StorageKeys.STATS_LEVELS_COMPLETED, 0);
    StorageService.setNumber(StorageKeys.STATS_PERFECT_CLEARS, 0);
    StorageService.setNumber(StorageKeys.STATS_LONGEST_STREAK, 0);
    set({totalMoves: 0, totalPlaytimeMs: 0, levelsCompleted: 0, perfectClears: 0, longestStreak: 0});
  },
}));
