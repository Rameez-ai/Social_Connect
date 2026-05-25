/**
 * usePosts.js
 * ----------
 * Custom React hook that handles subscribing to real-time feed post updates.
 * Observes the user's "following" list in Redux and configures a Firestore
 * `onSnapshot` listener via `postService`.
 *
 * Synchronises all live updates directly with the Redux `posts` slice state.
 *
 * @module hooks/usePosts
 */

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import postService from '../services/postService';
import { setPosts, setLoading } from '../store/slices/postsSlice';

export const usePosts = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  // Subscribe to real-time feed updates
  useEffect(() => {
    if (!user) return;

    // The feed shows posts from the user's followed accounts + their own posts
    const feedUsers = [...(user.following || []), user.uid];

    dispatch(setLoading(true));
    
    // Set up Firestore onSnapshot listener via postService
    const unsubscribe = postService.subscribeToFeed(feedUsers, (updatedPosts) => {
      dispatch(setPosts(updatedPosts));
      dispatch(setLoading(false));
    });

    return () => unsubscribe(); // clean up subscription on unmount
  }, [user, dispatch]);

  /**
   * Pull-to-refresh feed handler.
   * Fetches fresh feed posts manually.
   */
  const refreshFeed = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const feedUsers = [...(user.following || []), user.uid];
      const { posts: freshPosts } = await postService.getPosts(feedUsers);
      dispatch(setPosts(freshPosts));
    } catch (error) {
      console.warn('[usePosts] Failed to refresh feed manually:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, dispatch]);

  return {
    posts,
    loading,
    refreshing,
    refreshFeed,
  };
};

export default usePosts;
