/**
 * helpers.js
 * ----------
 * Pure utility functions used throughout Social Connect.
 * None of these touch React state or Firebase — they are
 * deterministic helpers ideal for unit testing.
 *
 * @module utils/helpers
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import calendar from 'dayjs/plugin/calendar';

// ─── dayjs plugins ──────────────────────────────────────────────────────────────
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(calendar);

// Shorten the default English relativeTime strings so they look
// more "Instagram-like" (e.g. "2h" instead of "2 hours ago").
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'just now',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy',
  },
});

// ─── formatTimestamp ────────────────────────────────────────────────────────────

/**
 * Turn a Firestore-compatible timestamp into a human-readable relative string.
 *
 * Rules:
 *   • < 1 minute  → "just now"
 *   • < 1 hour    → "12m ago"
 *   • < 24 hours  → "5h ago"
 *   • < 7 days    → "3d ago"
 *   • Otherwise   → "Jan 12" or "Jan 12, 2024" (if different year)
 *
 * @param {import('firebase/firestore').Timestamp | Date | number | string} timestamp
 * @returns {string} Formatted relative time string.
 */
export const formatTimestamp = timestamp => {
  if (!timestamp) {
    return '';
  }

  // Firestore Timestamps have a toDate() method
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = dayjs();
  const then = dayjs(date);

  // Guard against invalid dates
  if (!then.isValid()) {
    return '';
  }

  const diffInSeconds = now.diff(then, 'second');
  const diffInDays = now.diff(then, 'day');

  // Less than 7 days → relative ("5h ago", "3d ago")
  if (diffInSeconds < 60) {
    return 'just now';
  }
  if (diffInDays < 7) {
    return then.fromNow();
  }

  // Same year → "Jan 12"
  if (then.year() === now.year()) {
    return then.format('MMM D');
  }

  // Different year → "Jan 12, 2024"
  return then.format('MMM D, YYYY');
};

// ─── truncateText ───────────────────────────────────────────────────────────────

/**
 * Truncate a string and append an ellipsis if it exceeds `maxLength`.
 *
 * @param {string} text      – The source string.
 * @param {number} maxLength – Maximum allowed characters (default 100).
 * @returns {string} Truncated (or original) string.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength).trimEnd()}…`;
};

// ─── generateId ─────────────────────────────────────────────────────────────────

/**
 * Generate a random alphanumeric ID.
 * Useful for local keys before Firestore assigns a doc ID.
 *
 * @param {number} length – Desired ID length (default 20).
 * @returns {string} Random string of the given length.
 */
export const generateId = (length = 20) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ─── getInitials ────────────────────────────────────────────────────────────────

/**
 * Extract up to two initials from a display name.
 * Used as a fallback when the user has no profile image.
 *
 * @param {string} name – Full display name (e.g. "Jane Doe").
 * @returns {string} One or two uppercase initials (e.g. "JD").
 *
 * @example
 *   getInitials('Jane Doe')       // "JD"
 *   getInitials('Alice')          // "A"
 *   getInitials('')               // "?"
 */
export const getInitials = name => {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') {
    return '?';
  }

  const first = parts[0][0]?.toUpperCase() ?? '';
  const last =
    parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() ?? '' : '';

  return `${first}${last}` || '?';
};

// ─── formatCount ────────────────────────────────────────────────────────────────

/**
 * Format large numbers into compact strings (1K, 1.2M, etc.).
 *
 * @param {number} count – Raw number.
 * @returns {string} Compact representation.
 *
 * @example
 *   formatCount(999)      // "999"
 *   formatCount(1_200)    // "1.2K"
 *   formatCount(53_400)   // "53.4K"
 *   formatCount(2_500_000) // "2.5M"
 */
export const formatCount = count => {
  if (count === null || count === undefined || isNaN(count)) {
    return '0';
  }

  const num = Number(count);

  if (num < 0) {
    return '0';
  }

  if (num < 1_000) {
    return num.toString();
  }

  if (num < 1_000_000) {
    const formatted = (num / 1_000).toFixed(1);
    // Drop ".0" (e.g. "5.0K" → "5K")
    return `${formatted.replace(/\.0$/, '')}K`;
  }

  if (num < 1_000_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return `${formatted.replace(/\.0$/, '')}M`;
  }

  const formatted = (num / 1_000_000_000).toFixed(1);
  return `${formatted.replace(/\.0$/, '')}B`;
};

// ─── validateEmail ──────────────────────────────────────────────────────────────

/**
 * Quick email format validation (not a substitute for Yup schemas,
 * but handy for inline checks).
 *
 * @param {string} email
 * @returns {boolean} `true` if the string looks like a valid email address.
 */
export const validateEmail = email => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // RFC-5322-ish regex – covers 99 %+ of real-world addresses
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};
