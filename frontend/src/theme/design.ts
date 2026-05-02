// Design System — premium, minimal, colorful accents

export const colors = {
  // Core
  primary: '#0F172A',
  primaryMuted: '#1E293B',
  accent: '#6366F1',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  surfaceDark: '#0F172A',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successBg: '#D1FAE5',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  info: '#3B82F6',
  infoBg: '#DBEAFE',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.04)',
};

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
  display: { fontSize: 44, fontWeight: '600' as const, letterSpacing: -1.2, lineHeight: 48 },
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

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
};
