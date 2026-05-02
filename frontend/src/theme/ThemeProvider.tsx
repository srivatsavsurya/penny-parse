import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '../context/AppContext';
import { getColorsFor, ThemeColors } from './design';

interface Ctx {
  colors: ThemeColors;
  isDark: boolean;
  mode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<Ctx | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useApp();
  const systemScheme = useColorScheme();
  const mode = settings.themeMode || 'system';
  const systemDark = systemScheme === 'dark';
  const value = useMemo<Ctx>(() => {
    const c = getColorsFor(mode, systemDark);
    const isDark = mode === 'dark' || (mode === 'system' && systemDark);
    return { colors: c, isDark, mode };
  }, [mode, systemDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Ctx => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback to light when no provider (rare)
    return { colors: getColorsFor('light', false), isDark: false, mode: 'light' };
  }
  return ctx;
};
