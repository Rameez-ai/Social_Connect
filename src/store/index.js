/**
 * Redux Store Configuration
 *
 * Central store setup using Redux Toolkit's configureStore.
 * Combines all feature slices (auth, posts, comments, chat, users, notifications)
 * and exports typed hooks for use throughout the app.
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

// Feature slice reducers
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import commentsReducer from './slices/commentsSlice';
import chatReducer from './slices/chatSlice';
import usersReducer from './slices/usersSlice';
import notificationsReducer from './slices/notificationsSlice';

/**
 * Configured Redux store with all feature slices.
 * Middleware includes the default middleware from RTK (thunk, serializability check, etc.).
 * Serializability check is customized to ignore Firestore Timestamp and DocumentSnapshot
 * objects that may appear in state (lastDoc for pagination).
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    chat: chatReducer,
    users: usersReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Firestore timestamps and document snapshots are non-serializable;
      // we whitelist them here so RTK doesn't warn in dev mode.
      serializableCheck: {
        ignoredPaths: [
          'posts.lastDoc',
          'auth.user.createdAt',
          'auth.user.updatedAt',
        ],
        ignoredActions: [
          'posts/fetchFeedPosts/fulfilled',
          'posts/fetchUserPosts/fulfilled',
        ],
      },
    }),
});

/**
 * Typed dispatch hook — use this instead of plain useDispatch
 * so async thunks are dispatched correctly.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed selector hook — use this instead of plain useSelector
 * for consistency across the codebase.
 */
export const useAppSelector = useSelector;

export default store;
