/**
 * HomeScreen.js
 * 
 * Main feed screen displaying posts from followed users.
 * Features:
 * - Header with 'Social Connect' branding + notifications bell (with badge)
 * - FlatList of PostCard components
 * - Pull-to-refresh via RefreshControl
 * - Infinite scroll pagination (onEndReached)
 * - SkeletonLoader during initial load
 * - EmptyState when no posts
 * - Real-time feed via usePosts() hook
 * - Floating action button (FAB) to create a new post
 * - Performance: keyExtractor, removeClippedSubviews, getItemLayout
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../utils/theme';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/post/PostCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');
const POST_CARD_HEIGHT = 450; // Estimated height for getItemLayout

const HomeScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications || { notifications: [] });

  // ─── Posts Hook (real-time subscription + pagination) ─────
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    initialLoad,
  } = usePosts();

  // ─── Derived State ────────────────────────────────────────
  /** Count of unread notifications for the badge */
  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ─── Handlers ─────────────────────────────────────────────

  /** Navigate to notifications screen */
  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  /** Navigate to create post screen */
  const handleCreatePost = useCallback(() => {
    navigation.navigate('CreatePost');
  }, [navigation]);

  /** Navigate to post detail */
  const handlePostPress = useCallback(
    (post) => {
      navigation.navigate('PostDetail', { postId: post.id });
    },
    [navigation]
  );

  /** Pull-to-refresh handler */
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  /** Infinite scroll – load more posts when nearing the end */
  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadMore();
    }
  }, [loadingMore, hasMore, loadMore]);

  /** Unique key for each post item */
  const keyExtractor = useCallback((item) => item.id, []);

  /**
   * getItemLayout for FlatList performance optimization.
   * Provides pre-calculated layout so items don't need to be measured.
   */
  const getItemLayout = useCallback(
    (_, index) => ({
      length: POST_CARD_HEIGHT,
      offset: POST_CARD_HEIGHT * index,
      index,
    }),
    []
  );

  // ─── Render Functions ─────────────────────────────────────

  /** Render each post card */
  const renderPost = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={() => handlePostPress(item)}
        currentUserId={user?.uid}
      />
    ),
    [handlePostPress, user?.uid]
  );

  /** Render the footer spinner when loading more */
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  }, [loadingMore]);

  /** Render the list header (spacing) */
  const renderHeader = useCallback(() => <View style={styles.listHeader} />, []);

  /** Separator between post cards */
  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: theme.border }]}
      />
    ),
    [theme.border]
  );

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* ─── Header ──────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* App Logo / Title */}
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Social Connect
        </Text>

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={handleNotifications}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="notifications-outline"
            size={26}
            color={theme.text}
          />
          {/* Badge */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Content ─────────────────────────────────────── */}
      {initialLoad && loading ? (
        /* Skeleton loader during initial fetch */
        <SkeletonLoader count={3} type="post" />
      ) : posts.length === 0 && !loading ? (
        /* Empty state when no posts */
        <EmptyState
          icon="images-outline"
          title="No posts yet"
          message="Follow users to see their posts here"
          actionLabel="Explore"
          onAction={() => navigation.navigate('Search')}
        />
      ) : (
        /* Posts feed list */
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={3}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.text}
              colors={['#833AB4', '#FD1D1D']}
            />
          }
        />
      )}

      {/* ─── Floating Action Button ──────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.85}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    // Instagram-style script feel
    fontStyle: 'italic',
  },
  bellButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FD1D1D',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // List
  listHeader: {
    height: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#833AB4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#833AB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default React.memo(HomeScreen);
