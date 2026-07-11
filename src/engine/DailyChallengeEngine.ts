import {LevelDefinition} from '../types';
import {LevelLoader} from './LevelLoader';

function dateKey(date: Date): string {
  // Local calendar date, not UTC — a "day" should match the day on the
  // player's own clock. Using toISOString() here would roll the day over
  // at UTC midnight, which happens mid-afternoon/evening in most
  // non-UTC timezones and makes the streak look broken (fails to advance,
  // or resets) even though the player played once per their own day.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministically picks one level per local calendar day so every player
 * sees the same daily challenge without needing a backend.
 */
export const DailyChallengeEngine = {
  todayKey(): string {
    return dateKey(new Date());
  },

  yesterdayKey(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  },

  getLevelForDate(key: string): LevelDefinition {
    const levels = LevelLoader.getAllLevels();
    const index = hashString(key) % levels.length;
    return levels[index];
  },
};
