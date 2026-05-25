/**
 * .eslintrc.js
 * ------------
 * ESLint configuration for the Social Connect React Native app.
 *
 * Extends the official @react-native config and integrates Prettier
 * so formatting and linting never conflict.
 */

module.exports = {
  root: true,

  extends: [
    '@react-native',       // RN-specific rules (includes react, react-hooks, eslint basics)
    'prettier',            // disables ESLint rules that conflict with Prettier
  ],

  plugins: ['react', 'react-native', 'react-hooks'],

  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  env: {
    'react-native/react-native': true,
    es2021: true,
    jest: true,
  },

  rules: {
    // ── React Hooks ───────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',      // enforce Rules of Hooks
    'react-hooks/exhaustive-deps': 'warn',       // check effect dependencies

    // ── React ─────────────────────────────────────────────────────────────────
    'react/jsx-uses-react': 'off',               // not needed with new JSX transform
    'react/react-in-jsx-scope': 'off',           // not needed with new JSX transform
    'react/prop-types': 'off',                   // using JSDoc / TS-in-JSDoc instead
    'react/no-unstable-nested-components': 'warn',

    // ── React Native ──────────────────────────────────────────────────────────
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',           // too noisy for rapid iteration

    // ── General ───────────────────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
