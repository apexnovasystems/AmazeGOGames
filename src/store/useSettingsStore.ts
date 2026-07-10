import {create} from 'zustand';
import {StorageService} from '../services/StorageService';
import {StorageKeys} from '../constants/storageKeys';
import {ThemeMode} from '../theme';

export type ThemePreference = ThemeMode | 'system';

interface SettingsState {
  themePreference: ThemePreference;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  soundVolume: number;
  musicVolume: number;

  setThemePreference: (mode: ThemePreference) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVibration: () => void;
  setSoundVolume: (value: number) => void;
  setMusicVolume: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themePreference: StorageService.getString(StorageKeys.SETTINGS_THEME_MODE, 'system') as ThemePreference,
  soundEnabled: StorageService.getBoolean(StorageKeys.SETTINGS_SOUND_ENABLED, true),
  musicEnabled: StorageService.getBoolean(StorageKeys.SETTINGS_MUSIC_ENABLED, true),
  vibrationEnabled: StorageService.getBoolean(StorageKeys.SETTINGS_VIBRATION_ENABLED, true),
  soundVolume: StorageService.getNumber(StorageKeys.SETTINGS_SOUND_VOLUME, 0.8),
  musicVolume: StorageService.getNumber(StorageKeys.SETTINGS_MUSIC_VOLUME, 0.5),

  setThemePreference: mode => {
    StorageService.setString(StorageKeys.SETTINGS_THEME_MODE, mode);
    set({themePreference: mode});
  },
  toggleSound: () => {
    const next = !get().soundEnabled;
    StorageService.setBoolean(StorageKeys.SETTINGS_SOUND_ENABLED, next);
    set({soundEnabled: next});
  },
  toggleMusic: () => {
    const next = !get().musicEnabled;
    StorageService.setBoolean(StorageKeys.SETTINGS_MUSIC_ENABLED, next);
    set({musicEnabled: next});
  },
  toggleVibration: () => {
    const next = !get().vibrationEnabled;
    StorageService.setBoolean(StorageKeys.SETTINGS_VIBRATION_ENABLED, next);
    set({vibrationEnabled: next});
  },
  setSoundVolume: value => {
    StorageService.setNumber(StorageKeys.SETTINGS_SOUND_VOLUME, value);
    set({soundVolume: value});
  },
  setMusicVolume: value => {
    StorageService.setNumber(StorageKeys.SETTINGS_MUSIC_VOLUME, value);
    set({musicVolume: value});
  },
}));
