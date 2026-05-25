/**
 * theme.js
 * --------
 * App-wide theming system powered by React Context.
 *
 * Usage:
 *   // Wrap your app root:
 *   <ThemeProvider><App /></ThemeProvider>
 *
 *   // Inside any component:
 *   const { theme, isDark, toggleTheme } = useTheme();
 *
 * The selected mode (light | dark) is persisted to AsyncStorage so it
 * survives app restarts.
 *
 * @module utils/theme
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from './constants';

// ─── AsyncStorage Key ───────────────────────────────────────────────────────────
const THEME_STORAGE_KEY = '@social_connect_theme_mode';

// ─── Light Theme ────────────────────────────────────────────────────────────────
export const lightTheme = {
  mode: 'light',
  colors: {
    // Surfaces
    background: COLORS.lightBackground,
    surface: COLORS.lightSurface,
    card: COLORS.lightCard,
    inputBackground: COLORS.lightInputBackground,

    // Brand
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    primaryGradient: COLORS.primaryGradient,

    // Text
    text: COLORS.lightTextPrimary,
    textSecondary: COLORS.lightTextSecondary,
    textMuted: COLORS.lightTextMuted,

    // Borders / Dividers
    border: COLORS.lightBorder,
    separator: COLORS.gray200,

    // Interactive
    like: COLORS.like,
    link: COLORS.info,

    // Semantic
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,

    // Utility
    overlay: COLORS.overlay,
    white: COLORS.white,
    black: COLORS.black,
    transparent: COLORS.transparent,
    shimmer: COLORS.gray200,

    // Tab / Nav
    tabBarBackground: COLORS.white,
    tabBarBorder: COLORS.lightBorder,
    headerBackground: COLORS.white,
    headerText: COLORS.lightTextPrimary,

    // Status bar
    statusBar: 'dark-content',
  },
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────────
export const darkTheme = {
  mode: 'dark',
  colors: {
    // Surfaces
    background: COLORS.darkBackground,
    surface: COLORS.darkSurface,
    card: COLORS.darkCard,
    inputBackground: COLORS.darkInputBackground,

    // Brand
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    primaryGradient: COLORS.primaryGradient,

    // Text
    text: COLORS.darkTextPrimary,
    textSecondary: COLORS.darkTextSecondary,
    textMuted: COLORS.darkTextMuted,

    // Borders / Dividers
    border: COLORS.darkBorder,
    separator: COLORS.gray800,

    // Interactive
    like: COLORS.like,
    link: COLORS.info,

    // Semantic
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,

    // Utility
    overlay: COLORS.overlay,
    white: COLORS.white,
    black: COLORS.black,
    transparent: COLORS.transparent,
    shimmer: COLORS.shimmer,

    // Tab / Nav
    tabBarBackground: COLORS.darkSurface,
    tabBarBorder: COLORS.darkBorder,
    headerBackground: COLORS.darkBackground,
    headerText: COLORS.darkTextPrimary,

    // Status bar
    statusBar: 'light-content',
  },
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
};

// ─── Context ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ThemeContextValue
 * @property {typeof lightTheme} theme       – The active theme object.
 * @property {boolean}           isDark      – `true` when dark mode is active.
 * @property {() => void}        toggleTheme – Switch between light ↔ dark.
 * @property {(mode: 'light' | 'dark') => void} setThemeMode – Force a specific mode.
 */

/** @type {React.Context<ThemeContextValue>} */
export const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

// ─── Provider ───────────────────────────────────────────────────────────────────

/**
 * ThemeProvider
 * Reads the user's last-chosen mode from AsyncStorage on mount,
 * defaults to dark mode if nothing is stored.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // default to dark (Instagram-style)
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate the saved preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode !== null) {
          setIsDark(savedMode === 'dark');
        }
      } catch (error) {
        console.warn('[ThemeProvider] Failed to read saved theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  /**
   * Persist and apply a specific mode.
   * @param {'light' | 'dark'} mode
   */
  const setThemeMode = useCallback(async mode => {
    try {
      const dark = mode === 'dark';
      setIsDark(dark);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('[ThemeProvider] Failed to save theme:', error);
    }
  }, []);

  /** Toggle between light ↔ dark. */
  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  // Memoise the context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
      setThemeMode,
    }),
    [isDark, toggleTheme, setThemeMode],
  );

  // Don't render children until we know the saved preference (avoids flash)
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────────────────

/**
 * useTheme – convenience hook for consuming theme context.
 *
 * @returns {ThemeContextValue}
 * @example
 *   const { theme, isDark, toggleTheme } = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }} />
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return context;
};
