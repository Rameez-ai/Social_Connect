/**
 * constants.js
 * ------------
 * Central repository for every magic value in Social Connect.
 * Import from here instead of hard-coding colours, sizes, or collection names.
 *
 * @module utils/constants
 */

// ─── Color Palette ─────────────────────────────────────────────────────────────
// Instagram-inspired gradient: Purple → Red → Orange
export const COLORS = {
  // Primary brand gradient stops
  gradientStart: '#833AB4',   // purple
  gradientMiddle: '#FD1D1D',  // red
  gradientEnd: '#F77737',     // orange

  // Convenience alias – use in LinearGradient `colors` prop
  primaryGradient: ['#833AB4', '#FD1D1D', '#F77737'],

  // Brand accent (single-colour contexts where a gradient is impossible)
  primary: '#833AB4',
  secondary: '#FD1D1D',
  accent: '#F77737',

  // ── Dark-theme surfaces ──────────────────────────────────────────────────
  darkBackground: '#000000',
  darkSurface: '#121212',
  darkCard: '#1E1E1E',
  darkBorder: '#2C2C2C',
  darkInputBackground: '#262626',

  // ── Light-theme surfaces ─────────────────────────────────────────────────
  lightBackground: '#FAFAFA',
  lightSurface: '#FFFFFF',
  lightCard: '#FFFFFF',
  lightBorder: '#DBDBDB',
  lightInputBackground: '#F0F0F0',

  // ── Text colours ─────────────────────────────────────────────────────────
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#A0A0A0',
  darkTextMuted: '#666666',

  lightTextPrimary: '#262626',
  lightTextSecondary: '#8E8E8E',
  lightTextMuted: '#C7C7C7',

  // ── Grays (theme-agnostic) ───────────────────────────────────────────────
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // ── Semantic ─────────────────────────────────────────────────────────────
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  like: '#ED4956',  // Instagram heart-red

  // ── Misc ─────────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#2A2A2A',
};

// ─── Fonts ──────────────────────────────────────────────────────────────────────
// System fonts with cross-platform fallbacks.
export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
};

// ─── Font Sizes ─────────────────────────────────────────────────────────────────
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  title: 32,
};

// ─── Spacing (8-pt grid) ────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ─── Border Radius ──────────────────────────────────────────────────────────────
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999, // pill / circular
};

// ─── Firestore Collection Names ─────────────────────────────────────────────────
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
};

// ─── Image Size Limits ──────────────────────────────────────────────────────────
/** Maximum width/height (px) for post images after resizing */
export const POST_IMAGE_MAX_SIZE = 1080;

/** Maximum width/height (px) for profile avatars after resizing */
export const PROFILE_IMAGE_MAX_SIZE = 400;

/** Maximum file size in bytes (5 MB) for any uploaded image */
export const IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

// ─── Pagination ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

// ─── Misc ───────────────────────────────────────────────────────────────────────
export const APP_NAME = 'Social Connect';
export const ANIMATION_DURATION = 300; // ms – default transition length
