import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profileData: null,
  followers: [],
  following: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setProfileData: (state, action) => {
      state.profileData = action.payload;
      state.error = null;
    },
    setFollowers: (state, action) => {
      state.followers = action.payload;
    },
    setFollowing: (state, action) => {
      state.following = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearUserData: (state) => {
      state.profileData = null;
      state.followers = [];
      state.following = [];
    },
  },
});

export const {
  setLoading,
  setProfileData,
  setFollowers,
  setFollowing,
  setError,
  clearUserData,
} = userSlice.actions;
export default userSlice.reducer;
