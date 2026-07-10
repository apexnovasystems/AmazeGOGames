/**
 * PaintRoll color system.
 * Two full palettes (light / dark) sharing the same brand hues so the
 * game reads as one consistent product in either mode.
 */

export interface ColorPalette {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;

  // Surfaces
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  surface: string;
  surfaceElevated: string;
  glass: string;
  glassBorder: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Feedback
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Game specific
  tileEmpty: string;
  tilePainted: string;
  tileWall: string;
  tileObstacle: string;
  tileLocked: string;
  tileIce: string;
  tilePortal: string;
  tileTeleport: string;
  ballCore: string;
  ballGlow: string;
  gridBackground: string;
  star: string;
  starEmpty: string;
  coin: string;

  overlay: string;
  shadow: string;
}

export const lightPalette: ColorPalette = {
  primary: '#7C5CFF',
  primaryDark: '#5B3FD6',
  primaryLight: '#A78BFA',
  secondary: '#06D6C6',
  accent: '#FF6B6B',

  background: '#F4F5FB',
  backgroundGradientStart: '#EEF0FB',
  backgroundGradientEnd: '#DCE0F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  glass: 'rgba(255,255,255,0.6)',
  glassBorder: 'rgba(255,255,255,0.8)',

  textPrimary: '#1B1B2E',
  textSecondary: '#585873',
  textMuted: '#8B8BA7',
  textOnPrimary: '#FFFFFF',

  success: '#22C55E',
  warning: '#F5A623',
  danger: '#F0466B',
  info: '#3B9EFF',

  tileEmpty: '#E4E6F5',
  tilePainted: '#7C5CFF',
  tileWall: '#3A3A54',
  tileObstacle: '#6B6B87',
  tileLocked: '#B8B8CE',
  tileIce: '#9EE7F5',
  tilePortal: '#FF6B6B',
  tileTeleport: '#06D6C6',
  ballCore: '#FFFFFF',
  ballGlow: '#7C5CFF',
  gridBackground: '#DEE1F3',
  star: '#FFC94D',
  starEmpty: '#D9DAEA',
  coin: '#FFC94D',

  overlay: 'rgba(15,15,26,0.55)',
  shadow: 'rgba(41,37,84,0.25)',
};

export const darkPalette: ColorPalette = {
  primary: '#8B6BFF',
  primaryDark: '#6947E0',
  primaryLight: '#B3A0FF',
  secondary: '#22E6D4',
  accent: '#FF7A85',

  background: '#0E0E1A',
  backgroundGradientStart: '#14142B',
  backgroundGradientEnd: '#0A0A16',
  surface: '#1B1B33',
  surfaceElevated: '#22224294',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.14)',

  textPrimary: '#F5F5FF',
  textSecondary: '#B7B7D6',
  textMuted: '#7A7A9E',
  textOnPrimary: '#FFFFFF',

  success: '#34D976',
  warning: '#FFB84D',
  danger: '#FF5C7C',
  info: '#4FB2FF',

  tileEmpty: '#242444',
  tilePainted: '#8B6BFF',
  tileWall: '#050510',
  tileObstacle: '#42425F',
  tileLocked: '#33334F',
  tileIce: '#5FD9EE',
  tilePortal: '#FF7A85',
  tileTeleport: '#22E6D4',
  ballCore: '#FFFFFF',
  ballGlow: '#8B6BFF',
  gridBackground: '#17172E',
  star: '#FFD166',
  starEmpty: '#2C2C4C',
  coin: '#FFD166',

  overlay: 'rgba(0,0,0,0.65)',
  shadow: 'rgba(0,0,0,0.5)',
};

export const themedPalettes = {
  light: lightPalette,
  dark: darkPalette,
};
