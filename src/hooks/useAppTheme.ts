import {useColorScheme} from 'react-native';
import {useSettingsStore} from '../store/useSettingsStore';
import {useProgressStore} from '../store/useProgressStore';
import {buildTheme, Theme, ThemeMode} from '../theme';

/** Resolves the active Theme object from the user's preference + OS scheme + owned color skin. */
export function useAppTheme(): Theme {
  const themePreference = useSettingsStore(state => state.themePreference);
  const systemScheme = useColorScheme();
  const activeThemeId = useProgressStore(state => state.activeThemeId);

  const mode: ThemeMode = themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  return buildTheme(mode, activeThemeId);
}
