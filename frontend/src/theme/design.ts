// Design System - Inspired by Sure.am
// Clean, minimal, premium aesthetic

export const colors = {
  // Primary
  primary: '#000000',
  primaryMuted: '#1a1a1a',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  
  // Text
  textPrimary: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.03)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Large display
  display: {
    fontSize: 48,
    fontWeight: '300' as const,
    letterSpacing: -1,
    lineHeight: 52,
  },
  // Amount display
  amount: {
    fontSize: 32,
    fontWeight: '500' as const,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  // Title
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  // Body medium
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  // Small
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
};
