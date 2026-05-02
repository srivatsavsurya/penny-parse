// Light + Dark themes following Apple HIG
import { ThemeMode } from '../types';

const lightColors = {
  primary: '#0F172A',
  primaryMuted: '#1E293B',
  accent: '#0A84FF',
  accentMuted: '#5AC8FA',
  gradientStart: '#0A84FF',
  gradientEnd: '#5E5CE6',

  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F8F9FB',
  surfaceDark: '#0F172A',

  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  success: '#34C759',
  successBg: '#D9F8E1',
  error: '#FF3B30',
  errorBg: '#FFE2E0',
  warning: '#FF9500',
  warningBg: '#FFEFD0',
  info: '#0A84FF',
  infoBg: '#DCEEFF',

  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  separator: 'rgba(60, 60, 67, 0.12)',

  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayLight: 'rgba(0, 0, 0, 0.04)',
  scrim: 'rgba(255,255,255,0.8)',
};

const darkColors: typeof lightColors = {
  primary: '#FFFFFF',
  primaryMuted: '#E5E5EA',
  accent: '#0A84FF',
  accentMuted: '#5AC8FA',
  gradientStart: '#0A84FF',
  gradientEnd: '#5E5CE6',

  background: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceSecondary: '#1C1C1E',
  surfaceDark: '#000000',

  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#6E6E73',
  textInverse: '#000000',

  success: '#30D158',
  successBg: 'rgba(48, 209, 88, 0.18)',
  error: '#FF453A',
  errorBg: 'rgba(255, 69, 58, 0.18)',
  warning: '#FF9F0A',
  warningBg: 'rgba(255, 159, 10, 0.18)',
  info: '#0A84FF',
  infoBg: 'rgba(10, 132, 255, 0.18)',

  border: '#38383A',
  borderLight: '#2C2C2E',
  separator: 'rgba(84, 84, 88, 0.6)',

  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  scrim: 'rgba(0,0,0,0.8)',
};

export type ThemeColors = typeof lightColors;

export const getColorsFor = (mode: ThemeMode, systemDark: boolean): ThemeColors => {
  if (mode === 'system') return systemDark ? darkColors : lightColors;
  return mode === 'dark' ? darkColors : lightColors;
};

// Backwards compatibility — default light colors
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  display: { fontSize: 44, fontWeight: '700' as const, letterSpacing: -1.2, lineHeight: 48 },
  largeTitle: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 38 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 30 },
  subtitle: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, letterSpacing: 0, lineHeight: 22 },
  bodySemibold: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 18 },
  smallMedium: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6, lineHeight: 14 },
};
