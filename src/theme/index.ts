import {themedPalettes, ColorPalette} from './colors';
import {spacing, radius} from './spacing';
import {typography, fontFamily, fontSize} from './typography';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const buildTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: themedPalettes[mode],
  spacing,
  radius,
  typography,
});

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

export * from './colors';
export * from './spacing';
export {typography, fontFamily, fontSize};
