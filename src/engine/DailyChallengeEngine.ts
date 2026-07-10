import {LevelDefinition} from '../types';
import {LevelLoader} from './LevelLoader';

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministically picks one level per calendar day (UTC) so every player
 * sees the same daily challenge without needing a backend.
 */
export const DailyChallengeEngine = {
  todayKey(): string {
    return dateKey(new Date());
  },

  yesterdayKey(): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    return dateKey(date);
  },

  getLevelForDate(key: string): LevelDefinition {
    const levels = LevelLoader.getAllLevels();
    const index = hashString(key) % levels.length;
    return levels[index];
  },
};
