import {useColorScheme} from 'react-native';
import {useSettingsStore} from '../store/useSettingsStore';
import {buildTheme, Theme, ThemeMode} from '../theme';

/** Resolves the active Theme object from the user's preference + OS scheme. */
export function useAppTheme(): Theme {
  const themePreference = useSettingsStore(state => state.themePreference);
  const systemScheme = useColorScheme();

  const mode: ThemeMode = themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  return buildTheme(mode);
}
