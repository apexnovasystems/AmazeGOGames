import {themedPalettes, ColorPalette} from './colors';
import {spacing, radius} from './spacing';
import {typography, fontFamily, fontSize} from './typography';
import {DEFAULT_THEME_SKIN_ID, getThemeSkin} from '../constants/themeSkins';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  skinId: string;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const buildTheme = (mode: ThemeMode, skinId: string = DEFAULT_THEME_SKIN_ID): Theme => {
  const skin = getThemeSkin(skinId);
  return {
    mode,
    skinId: skin.id,
    colors: {...themedPalettes[mode], ...skin.overrides},
    spacing,
    radius,
    typography,
  };
};

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

export * from './colors';
export * from './spacing';
export {typography, fontFamily, fontSize};
