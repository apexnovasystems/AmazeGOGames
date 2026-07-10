/** Central registry of every MMKV key so we never collide or typo a key string. */
export const StorageKeys = {
  CURRENT_LEVEL_ID: 'progress.currentLevelId',
  LEVEL_PROGRESS_MAP: 'progress.levelProgressMap',
  COINS: 'economy.coins',
  TOTAL_STARS: 'economy.totalStars',
  OWNED_THEMES: 'economy.ownedThemes',
  ACTIVE_THEME_ID: 'economy.activeThemeId',
  REMOVE_ADS_PURCHASED: 'economy.removeAdsPurchased',

  SETTINGS_THEME_MODE: 'settings.themeMode',
  SETTINGS_SOUND_ENABLED: 'settings.soundEnabled',
  SETTINGS_MUSIC_ENABLED: 'settings.musicEnabled',
  SETTINGS_VIBRATION_ENABLED: 'settings.vibrationEnabled',
  SETTINGS_SOUND_VOLUME: 'settings.soundVolume',
  SETTINGS_MUSIC_VOLUME: 'settings.musicVolume',

  STATS_TOTAL_MOVES: 'stats.totalMoves',
  STATS_TOTAL_PLAYTIME_MS: 'stats.totalPlaytimeMs',
  STATS_LEVELS_COMPLETED: 'stats.levelsCompleted',
  STATS_PERFECT_CLEARS: 'stats.perfectClears',
  STATS_LONGEST_STREAK: 'stats.longestStreak',

  ACHIEVEMENTS_UNLOCKED: 'achievements.unlocked',

  DAILY_CHALLENGE_DATE: 'daily.date',
  DAILY_CHALLENGE_COMPLETED: 'daily.completed',
  DAILY_CHALLENGE_STREAK: 'daily.streak',
  DAILY_CHALLENGE_LAST_CLAIM: 'daily.lastClaimDate',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
