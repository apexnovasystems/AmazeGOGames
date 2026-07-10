import {create} from 'zustand';
import {StorageService} from '../services/StorageService';
import {StorageKeys} from '../constants/storageKeys';
import {GameConfig} from '../constants/gameConfig';
import {DailyChallengeEngine} from '../engine/DailyChallengeEngine';
import {useProgressStore} from './useProgressStore';
import {useStatsStore} from './useStatsStore';

interface DailyChallengeState {
  lastCompletedDate: string | null;
  streak: number;

  isCompletedToday: () => boolean;
  /** Idempotent per calendar day — awards bonus coins and advances the streak once. */
  completeToday: () => void;
  resetAll: () => void;
}

export const useDailyChallengeStore = create<DailyChallengeState>((set, get) => ({
  lastCompletedDate: StorageService.getString(StorageKeys.DAILY_CHALLENGE_LAST_CLAIM, '') || null,
  streak: StorageService.getNumber(StorageKeys.DAILY_CHALLENGE_STREAK, 0),

  isCompletedToday: () => get().lastCompletedDate === DailyChallengeEngine.todayKey(),

  completeToday: () => {
    const today = DailyChallengeEngine.todayKey();
    const {lastCompletedDate, streak} = get();
    if (lastCompletedDate === today) {
      return;
    }

    const nextStreak = lastCompletedDate === DailyChallengeEngine.yesterdayKey() ? streak + 1 : 1;

    StorageService.setString(StorageKeys.DAILY_CHALLENGE_LAST_CLAIM, today);
    StorageService.setString(StorageKeys.DAILY_CHALLENGE_DATE, today);
    StorageService.setNumber(StorageKeys.DAILY_CHALLENGE_STREAK, nextStreak);
    set({lastCompletedDate: today, streak: nextStreak});

    useProgressStore.getState().addCoins(GameConfig.DAILY_CHALLENGE_COIN_REWARD);
    useStatsStore.getState().recordStreak(nextStreak);
  },

  resetAll: () => {
    StorageService.delete(StorageKeys.DAILY_CHALLENGE_DATE);
    StorageService.delete(StorageKeys.DAILY_CHALLENGE_COMPLETED);
    StorageService.delete(StorageKeys.DAILY_CHALLENGE_STREAK);
    StorageService.delete(StorageKeys.DAILY_CHALLENGE_LAST_CLAIM);
    set({lastCompletedDate: null, streak: 0});
  },
}));
