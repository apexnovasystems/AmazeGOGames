import {create} from 'zustand';
import {StorageService} from '../services/StorageService';
import {StorageKeys} from '../constants/storageKeys';
import {ACHIEVEMENTS, AchievementMetric} from '../constants/achievements';
import {useProgressStore} from './useProgressStore';
import {useStatsStore} from './useStatsStore';
import {useDailyChallengeStore} from './useDailyChallengeStore';

interface AchievementsState {
  unlockedIds: string[];
  /** Most recently unlocked achievement id, shown as a toast then dismissed. */
  justUnlocked: string | null;

  /** Re-checks every achievement against current stats/progress and unlocks any newly-met ones. */
  evaluate: () => void;
  dismissToast: () => void;
  resetAll: () => void;
}

function readMetric(metric: AchievementMetric): number {
  switch (metric) {
    case 'levelsCompleted':
      return useStatsStore.getState().levelsCompleted;
    case 'perfectClears':
      return useStatsStore.getState().perfectClears;
    case 'totalMoves':
      return useStatsStore.getState().totalMoves;
    case 'totalStars':
      return useProgressStore.getState().totalStars;
    case 'dailyStreak':
      return useDailyChallengeStore.getState().streak;
    default:
      return 0;
  }
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  unlockedIds: StorageService.getObject<string[]>(StorageKeys.ACHIEVEMENTS_UNLOCKED, []),
  justUnlocked: null,

  evaluate: () => {
    const unlocked = new Set(get().unlockedIds);
    let newlyUnlocked: string | null = null;

    for (const def of ACHIEVEMENTS) {
      if (unlocked.has(def.id)) {
        continue;
      }
      if (readMetric(def.metric) >= def.target) {
        unlocked.add(def.id);
        useProgressStore.getState().addCoins(def.coinsReward);
        newlyUnlocked = def.id;
      }
    }

    if (newlyUnlocked) {
      const list = Array.from(unlocked);
      StorageService.setObject(StorageKeys.ACHIEVEMENTS_UNLOCKED, list);
      set({unlockedIds: list, justUnlocked: newlyUnlocked});
    }
  },

  dismissToast: () => set({justUnlocked: null}),

  resetAll: () => {
    StorageService.delete(StorageKeys.ACHIEVEMENTS_UNLOCKED);
    set({unlockedIds: [], justUnlocked: null});
  },
}));
