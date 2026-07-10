import {create} from 'zustand';
import {StorageService} from '../services/StorageService';
import {StorageKeys} from '../constants/storageKeys';
import {LevelProgress, StarRatingResult} from '../types';

interface ProgressState {
  currentLevelId: string | null;
  coins: number;
  totalStars: number;
  levelProgress: Record<string, LevelProgress>;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setCurrentLevel: (levelId: string) => void;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  isLevelUnlocked: (levelId: string, levelOrder: number, orderedLevelIds: string[]) => boolean;
  unlockLevel: (levelId: string) => void;
  recordLevelResult: (levelId: string, result: StarRatingResult, timeMs: number) => void;
}

function persistLevelProgress(map: Record<string, LevelProgress>) {
  StorageService.setObject(StorageKeys.LEVEL_PROGRESS_MAP, map);
}

function computeTotalStars(map: Record<string, LevelProgress>): number {
  return Object.values(map).reduce((sum, p) => sum + p.stars, 0);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  currentLevelId: StorageService.getString(StorageKeys.CURRENT_LEVEL_ID) || null,
  coins: StorageService.getNumber(StorageKeys.COINS, 100),
  totalStars: StorageService.getNumber(StorageKeys.TOTAL_STARS, 0),
  levelProgress: StorageService.getObject<Record<string, LevelProgress>>(StorageKeys.LEVEL_PROGRESS_MAP, {}),

  addCoins: amount => {
    const next = get().coins + amount;
    StorageService.setNumber(StorageKeys.COINS, next);
    set({coins: next});
  },

  spendCoins: amount => {
    const current = get().coins;
    if (current < amount) {
      return false;
    }
    const next = current - amount;
    StorageService.setNumber(StorageKeys.COINS, next);
    set({coins: next});
    return true;
  },

  setCurrentLevel: levelId => {
    StorageService.setString(StorageKeys.CURRENT_LEVEL_ID, levelId);
    set({currentLevelId: levelId});
  },

  getLevelProgress: levelId => get().levelProgress[levelId],

  isLevelUnlocked: (levelId, levelOrder, orderedLevelIds) => {
    if (levelOrder === 0) {
      return true;
    }
    const map = get().levelProgress;
    if (map[levelId]?.unlocked) {
      return true;
    }
    const previousId = orderedLevelIds[levelOrder - 1];
    return Boolean(previousId && map[previousId]?.completed);
  },

  unlockLevel: levelId => {
    const map = {...get().levelProgress};
    const existing = map[levelId];
    map[levelId] = existing
      ? {...existing, unlocked: true}
      : {levelId, completed: false, stars: 0, bestMoves: null, bestTimeMs: null, unlocked: true};
    persistLevelProgress(map);
    set({levelProgress: map});
  },

  recordLevelResult: (levelId, result, timeMs) => {
    const map = {...get().levelProgress};
    const existing = map[levelId];
    const bestMoves =
      existing?.bestMoves != null ? Math.min(existing.bestMoves, result.moveCount) : result.moveCount;
    const bestTimeMs = existing?.bestTimeMs != null ? Math.min(existing.bestTimeMs, timeMs) : timeMs;
    const stars = existing ? (Math.max(existing.stars, result.stars) as 0 | 1 | 2 | 3) : result.stars;

    map[levelId] = {
      levelId,
      completed: true,
      stars,
      bestMoves,
      bestTimeMs,
      unlocked: true,
    };
    persistLevelProgress(map);
    const totalStars = computeTotalStars(map);
    StorageService.setNumber(StorageKeys.TOTAL_STARS, totalStars);
    set({levelProgress: map, totalStars});
  },
}));
