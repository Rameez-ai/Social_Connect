/**
 * Auth Slice
 *
 * Manages authentication state: current user, loading/error states.
 * Async thunks delegate to authService and userService for Firebase
 * auth and Firestore user-document operations.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import userService from '../../services/userService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /** Current authenticated user object (profile data from Firestore) */
  user: null,
  /** Whether a user is currently signed in */
  isAuthenticated: false,
  /** Global auth loading flag */
  loading: false,
  /** Last auth-related error message */
  error: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * loginUser — sign in with email & password.
 * After Firebase auth succeeds, fetch the Firestore user profile
 * so we have the full user object (displayName, avatar, bio, etc.).
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await authService.signIn(email, password);
      const userProfile = await userService.getUserProfile(credential.user.uid);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        ...userProfile,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed. Please try again.');
    }
  },
);

/**
 * signUpUser — create a new account and initialise the Firestore profile.
 * Expects { email, password, username, fullName }.
 */
export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, username, fullName }, { rejectWithValue }) => {
    try {
      const credential = await authService.signUp(email, password);
      const uid = credential.user.uid;

      // Build the initial user document for Firestore
      const userProfile = {
        uid,
        email,
        username: username.toLowerCase(),
        fullName,
        bio: '',
        profilePicture: '',
        followers: [],
        following: [],
        postsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userService.createUserProfile(uid, userProfile);

      return userProfile;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Sign-up failed. Please try again.',
      );
    }
  },
);

/**
 * logoutUser — sign out of Firebase and clear local state.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed.');
    }
  },
);

/**
 * updateUserProfile — patch the Firestore user document and
 * return the merged profile so the store stays in sync.
 * Expects { uid, updates } where updates is a partial user object.
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ uid, updates }, { rejectWithValue }) => {
    try {
      await userService.updateUserProfile(uid, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      // Re-fetch the full profile to ensure consistency
      const updatedProfile = await userService.getUserProfile(uid);
      return { uid, ...updatedProfile };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update profile.',
      );
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * setUser — called from the useAuth hook when onAuthStateChanged fires.
     * Payload is the full user profile object or null.
     */
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },

    /** clearUser — reset to unauthenticated state. */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    /** setLoading — manually toggle the loading flag. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /** setError — manually set an error message. */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    /** clearError — dismiss the current error. */
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ── loginUser ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── signUpUser ──
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── logoutUser ──
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateUserProfile ──
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, setLoading, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;
