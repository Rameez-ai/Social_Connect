import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  Header,
  PostItem,
  LoadingScreen,
} from '../components';
import { colors, SPACING } from '../utils/colors';
import { postService } from '../services/postService';
import { setPosts, setLoading } from '../redux/slices/postSlice';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector(state => state.posts);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts on screen focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      dispatch(setLoading(true));
      const data = await postService.getPosts();
      dispatch(setPosts(data));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = (postId) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
    // In production, this would call postService.likePost(postId, userId)
  };

  const handleComment = (postId) => {
    navigation.navigate('Comments', { postId });
  };

  const handlePostPress = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }) => (
    <PostItem
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onPress={() => handlePostPress(item.id)}
      liked={likedPosts.has(item.id)}
    />
  );

  if (isLoading && !refreshing) {
    return <LoadingScreen message="Loading posts..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Social Connect"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.emptyLink}>Create the first post →</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bellIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: SPACING.md,
  },
  emptyLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '700',
  },
});

export default Home;
