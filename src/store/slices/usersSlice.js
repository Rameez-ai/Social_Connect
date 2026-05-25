/**
 * Users Slice
 *
 * Handles user search, profile viewing, and follow/unfollow operations.
 * Separate from authSlice because this manages *other* users' data,
 * not the currently authenticated user.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /** Results from the latest user search query */
  searchResults: [],
  /** Full profile of a user being viewed (not the current user) */
  viewedProfile: null,
  /** Loading flag */
  loading: false,
  /** Last error message */
  error: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * searchUsers — query users by username or full name.
 * @param {string} query - The search string
 */
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      // Skip empty queries
      if (!query || query.trim().length === 0) {
        return [];
      }
      const results = await userService.searchUsers(query.trim());
      return results;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to search users.',
      );
    }
  },
);

/**
 * fetchUserProfile — load the full profile document for a user.
 * @param {string} userId
 */
export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await userService.getUserProfile(userId);
      return { uid: userId, ...profile };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch user profile.',
      );
    }
  },
);

/**
 * toggleFollow — follow or unfollow a user.
 * Updates both the current user's `following` array and the
 * target user's `followers` array atomically via userService.
 *
 * @param {Object} params - { currentUserId, targetUserId }
 */
export const toggleFollow = createAsyncThunk(
  'users/toggleFollow',
  async ({ currentUserId, targetUserId }, { rejectWithValue }) => {
    try {
      const result = await userService.toggleFollow(
        currentUserId,
        targetUserId,
      );
      return {
        currentUserId,
        targetUserId,
        isFollowing: result.isFollowing,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to toggle follow.',
      );
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    /** setSearchResults — replace search results array. */
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },

    /** setViewedProfile — set the profile being viewed. */
    setViewedProfile: (state, action) => {
      state.viewedProfile = action.payload;
    },

    /** clearSearchResults — empty the search results (e.g., on blur). */
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    /**
     * updateFollowStatus — optimistically toggle follow in viewedProfile.
     * Payload: { targetUserId, currentUserId, isFollowing }
     */
    updateFollowStatus: (state, action) => {
      const { targetUserId, currentUserId, isFollowing } = action.payload;

      // Update viewedProfile if it matches the target user
      if (state.viewedProfile && state.viewedProfile.uid === targetUserId) {
        const followers = [...(state.viewedProfile.followers || [])];
        if (isFollowing) {
          if (!followers.includes(currentUserId)) {
            followers.push(currentUserId);
          }
        } else {
          const idx = followers.indexOf(currentUserId);
          if (idx !== -1) {
            followers.splice(idx, 1);
          }
        }
        state.viewedProfile = { ...state.viewedProfile, followers };
      }

      // Also update the user in search results if present
      state.searchResults = state.searchResults.map((user) => {
        if (user.uid === targetUserId) {
          const followers = [...(user.followers || [])];
          if (isFollowing && !followers.includes(currentUserId)) {
            followers.push(currentUserId);
          } else if (!isFollowing) {
            const idx = followers.indexOf(currentUserId);
            if (idx !== -1) followers.splice(idx, 1);
          }
          return { ...user, followers };
        }
        return user;
      });
    },
  },

  extraReducers: (builder) => {
    // ── searchUsers ──
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchUserProfile ──
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.viewedProfile = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── toggleFollow ──
    builder
      .addCase(toggleFollow.pending, (state) => {
        // No global loading — we use optimistic UI via updateFollowStatus
        state.error = null;
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { currentUserId, targetUserId, isFollowing } = action.payload;

        // Sync viewedProfile followers
        if (state.viewedProfile && state.viewedProfile.uid === targetUserId) {
          const followers = [...(state.viewedProfile.followers || [])];
          if (isFollowing && !followers.includes(currentUserId)) {
            followers.push(currentUserId);
          } else if (!isFollowing) {
            const idx = followers.indexOf(currentUserId);
            if (idx !== -1) followers.splice(idx, 1);
          }
          state.viewedProfile = { ...state.viewedProfile, followers };
        }

        state.error = null;
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setSearchResults,
  setViewedProfile,
  clearSearchResults,
  updateFollowStatus,
} = usersSlice.actions;

export default usersSlice.reducer;
