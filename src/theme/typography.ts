import {Platform} from 'react-native';

/**
 * Font family names resolve to the system font by default.
 * Custom display/body fonts can be dropped into src/assets/fonts and
 * referenced here once linked (react-native.config.js -> assets).
 */
export const fontFamily = {
  display: Platform.select({android: 'sans-serif-black', ios: 'System', default: 'System'}),
  heading: Platform.select({android: 'sans-serif-medium', ios: 'System', default: 'System'}),
  body: Platform.select({android: 'sans-serif', ios: 'System', default: 'System'}),
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 44,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: '500' as const,
  },
  button: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
};
