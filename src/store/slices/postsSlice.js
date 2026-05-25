/**
 * Posts Slice
 *
 * Manages the global feed, user-specific posts, pagination (lastDoc),
 * and loading/error state. Real-time updates from Firestore onSnapshot
 * are handled by dispatching the synchronous setPosts / setUserPosts
 * reducers from the usePosts hook.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /** Array of post objects for the main feed */
  posts: [],
  /** Array of posts belonging to a specific user (profile screen) */
  userPosts: [],
  /** Loading flag for post-related operations */
  loading: false,
  /** Last error message */
  error: null,
  /**
   * Firestore DocumentSnapshot used for cursor-based pagination.
   * Non-serializable — whitelisted in store config.
   */
  lastDoc: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * fetchFeedPosts — load paginated feed posts.
 * Uses the current lastDoc to fetch the next page.
 * @param {Object} params - { limit?: number, refresh?: boolean }
 */
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeedPosts',
  async ({ limit = 10, refresh = false } = {}, { getState, rejectWithValue }) => {
    try {
      const { posts } = getState();
      const startAfter = refresh ? null : posts.lastDoc;
      const result = await postService.getFeedPosts(limit, startAfter);
      return { ...result, refresh };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch feed posts.');
    }
  },
);

/**
 * createPost — upload a new post (image + caption).
 * @param {Object} postData - { imageUri, caption, userId, username, userAvatar }
 */
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const newPost = await postService.createPost(postData);
      return newPost;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create post.');
    }
  },
);

/**
 * deletePost — remove a post by its ID.
 * Also deletes the associated image from Storage (handled by postService).
 */
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete post.');
    }
  },
);

/**
 * editPost — update caption or other editable fields.
 * @param {Object} params - { postId, updates }
 */
export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({ postId, updates }, { rejectWithValue }) => {
    try {
      await postService.updatePost(postId, updates);
      return { postId, updates };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to edit post.');
    }
  },
);

/**
 * toggleLike — like or unlike a post.
 * @param {Object} params - { postId, userId }
 */
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const result = await postService.toggleLike(postId, userId);
      return { postId, userId, liked: result.liked };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle like.');
    }
  },
);

/**
 * fetchUserPosts — load all posts by a specific user.
 * Used on profile screens.
 * @param {string} userId
 */
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const userPosts = await postService.getUserPosts(userId);
      return userPosts;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user posts.');
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /**
     * setPosts — replace the entire feed array.
     * Typically called from the usePosts hook on snapshot updates.
     */
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    /** addPost — prepend a new post to the feed. */
    addPost: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },

    /** removePost — remove a post from both feed and userPosts by ID. */
    removePost: (state, action) => {
      const postId = action.payload;
      state.posts = state.posts.filter((p) => p.id !== postId);
      state.userPosts = state.userPosts.filter((p) => p.id !== postId);
    },

    /** updatePost — merge updates into an existing post object. */
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const idx = state.posts.findIndex((p) => p.id === postId);
      if (idx !== -1) {
        state.posts[idx] = { ...state.posts[idx], ...updates };
      }
      const userIdx = state.userPosts.findIndex((p) => p.id === postId);
      if (userIdx !== -1) {
        state.userPosts[userIdx] = { ...state.userPosts[userIdx], ...updates };
      }
    },

    /** setUserPosts — replace the user-posts array (profile screen). */
    setUserPosts: (state, action) => {
      state.userPosts = action.payload;
    },

    /**
     * updatePostLikes — optimistically toggle a like on a post.
     * Payload: { postId, userId, liked }
     */
    updatePostLikes: (state, action) => {
      const { postId, userId, liked } = action.payload;

      const updateLikes = (post) => {
        if (!post || post.id !== postId) return post;
        const likes = [...(post.likes || [])];
        if (liked) {
          if (!likes.includes(userId)) likes.push(userId);
        } else {
          const i = likes.indexOf(userId);
          if (i !== -1) likes.splice(i, 1);
        }
        return { ...post, likes };
      };

      state.posts = state.posts.map(updateLikes);
      state.userPosts = state.userPosts.map(updateLikes);
    },

    /** setLoading — manually control the loading flag. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ── fetchFeedPosts ──
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        const { posts: newPosts, lastDoc, refresh } = action.payload;
        state.posts = refresh ? newPosts : [...state.posts, ...newPosts];
        state.lastDoc = lastDoc;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createPost ──
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
        state.userPosts = [action.payload, ...state.userPosts];
        state.loading = false;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── deletePost ──
    builder
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter((p) => p.id !== postId);
        state.userPosts = state.userPosts.filter((p) => p.id !== postId);
        state.loading = false;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── editPost ──
    builder
      .addCase(editPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const { postId, updates } = action.payload;
        const idx = state.posts.findIndex((p) => p.id === postId);
        if (idx !== -1) {
          state.posts[idx] = { ...state.posts[idx], ...updates };
        }
        const userIdx = state.userPosts.findIndex((p) => p.id === postId);
        if (userIdx !== -1) {
          state.userPosts[userIdx] = { ...state.userPosts[userIdx], ...updates };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── toggleLike ──
    builder
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, userId, liked } = action.payload;

        const updateLikes = (post) => {
          if (post.id !== postId) return post;
          const likes = [...(post.likes || [])];
          if (liked && !likes.includes(userId)) {
            likes.push(userId);
          } else if (!liked) {
            const i = likes.indexOf(userId);
            if (i !== -1) likes.splice(i, 1);
          }
          return { ...post, likes };
        };

        state.posts = state.posts.map(updateLikes);
        state.userPosts = state.userPosts.map(updateLikes);
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── fetchUserPosts ──
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPosts,
  addPost,
  removePost,
  updatePost,
  setUserPosts,
  updatePostLikes,
  setLoading,
} = postsSlice.actions;

export default postsSlice.reducer;
