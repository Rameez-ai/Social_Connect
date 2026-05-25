/**
 * Comments Slice
 *
 * Stores comments in a map keyed by postId so multiple posts'
 * comments can be cached simultaneously without collisions.
 *
 * Structure: comments: { [postId]: Comment[] }
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /**
   * Map of postId → Comment[].
   * Each Comment: { id, postId, userId, username, userAvatar, text, createdAt }
   */
  comments: {},
  /** Loading flag for comment operations */
  loading: false,
  /** Last error message */
  error: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * fetchComments — load all comments for a given post.
 * @param {string} postId
 */
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const comments = await commentService.getComments(postId);
      return { postId, comments };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch comments.',
      );
    }
  },
);

/**
 * addComment — create a new comment on a post.
 * @param {Object} params - { postId, userId, username, userAvatar, text }
 */
export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, userId, username, userAvatar, text }, { rejectWithValue }) => {
    try {
      const newComment = await commentService.addComment({
        postId,
        userId,
        username,
        userAvatar,
        text,
      });
      return { postId, comment: newComment };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to add comment.',
      );
    }
  },
);

/**
 * deleteComment — remove a comment by its ID.
 * @param {Object} params - { postId, commentId }
 */
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(postId, commentId);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to delete comment.',
      );
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    /**
     * setComments — replace comments for a specific post.
     * Payload: { postId, comments: Comment[] }
     */
    setComments: (state, action) => {
      const { postId, comments } = action.payload;
      state.comments[postId] = comments;
    },

    /**
     * addCommentToPost — append a single comment to a post's array.
     * Payload: { postId, comment }
     */
    addCommentToPost: (state, action) => {
      const { postId, comment } = action.payload;
      if (!state.comments[postId]) {
        state.comments[postId] = [];
      }
      state.comments[postId].push(comment);
    },

    /**
     * removeComment — remove a comment by ID from its post's array.
     * Payload: { postId, commentId }
     */
    removeComment: (state, action) => {
      const { postId, commentId } = action.payload;
      if (state.comments[postId]) {
        state.comments[postId] = state.comments[postId].filter(
          (c) => c.id !== commentId,
        );
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchComments ──
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── addComment ──
    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId].push(comment);
        state.loading = false;
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── deleteComment ──
    builder
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(
            (c) => c.id !== commentId,
          );
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setComments, addCommentToPost, removeComment } =
  commentsSlice.actions;

export default commentsSlice.reducer;
