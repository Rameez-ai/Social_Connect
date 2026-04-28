import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  isLoading: false,
  error: null,
  currentPost: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPosts: (state, action) => {
      state.posts = action.payload;
      state.error = null;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
  },
});

export const {
  setLoading,
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setError,
  setCurrentPost,
} = postSlice.actions;
export default postSlice.reducer;
