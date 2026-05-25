/**
 * ProfileScreen.js
 * ----------------
 * Current user's Instagram-style profile.
 * Shows avatar, stats (posts / followers / following), bio, and a 3-column
 * post grid.  Pull-to-refresh reloads everything.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../utils/theme';
import { fetchUserPosts } from '../../redux/slices/postsSlice';

// ─── Constants ──────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_SIZE = SCREEN_WIDTH / 3;
const AVATAR_SIZE = 90;
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/cccccc/969696?text=User';

// ─── Component ──────────────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Redux state
  const currentUser = useSelector((state) => state.auth.user);
  const { userPosts, loading: postsLoading } = useSelector((state) => state.posts);

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ── Derived data ────────────────────────────────────────────────────────────
  const userId = currentUser?.uid;
  const posts = useMemo(
    () => (userPosts[userId] ? userPosts[userId] : []),
    [userPosts, userId],
  );
  const postsCount = posts.length;
  const followersCount = currentUser?.followersCount ?? 0;
  const followingCount = currentUser?.followingCount ?? 0;

  // ── Data fetching ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      await dispatch(fetchUserPosts(userId)).unwrap();
    } catch (error) {
      console.warn('ProfileScreen – failed to load posts:', error);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    (async () => {
      await loadData();
      setInitialLoading(false);
    })();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const navigateToSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const navigateToEditProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation]);
  const navigateToPostDetail = useCallback(
    (post) => navigation.navigate('PostDetail', { postId: post.id }),
    [navigation],
  );

  // ── Styles (theme-aware, memoised) ──────────────────────────────────────────
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Header (avatar + stats + bio) ──────────────────────────────────────────
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.username} numberOfLines={1}>
            {currentUser?.username ?? 'username'}
          </Text>
          <TouchableOpacity onPress={navigateToSettings} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="settings-outline" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Avatar + stats row */}
        <View style={styles.profileRow}>
          {/* Avatar with edit overlay */}
          <View style={styles.avatarWrapper}>
            <FastImage
              style={styles.avatar}
              source={{
                uri: currentUser?.profilePicture || DEFAULT_AVATAR,
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
            <TouchableOpacity style={styles.editAvatarIcon} onPress={navigateToEditProfile}>
              <Icon name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatItem label="Posts" value={postsCount} theme={theme} />
            <StatItem
              label="Followers"
              value={followersCount}
              theme={theme}
              onPress={() => navigation.navigate('UserProfile', { userId, tab: 'followers' })}
            />
            <StatItem
              label="Following"
              value={followingCount}
              theme={theme}
              onPress={() => navigation.navigate('UserProfile', { userId, tab: 'following' })}
            />
          </View>
        </View>

        {/* Name & bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.displayName}>{currentUser?.displayName ?? ''}</Text>
          {currentUser?.bio ? <Text style={styles.bio}>{currentUser.bio}</Text> : null}
        </View>

        {/* Edit Profile button */}
        <TouchableOpacity style={styles.editProfileBtn} onPress={navigateToEditProfile}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Grid header */}
        <View style={styles.gridHeader}>
          <Icon name="grid-outline" size={22} color={theme.primary} />
        </View>
      </View>
    ),
    [
      styles,
      currentUser,
      postsCount,
      followersCount,
      followingCount,
      navigateToEditProfile,
      navigateToSettings,
      navigation,
      theme,
      userId,
    ],
  );

  // ── Post grid item ─────────────────────────────────────────────────────────
  const renderPostItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.postThumb}
        onPress={() => navigateToPostDetail(item)}
        activeOpacity={0.85}
      >
        <FastImage
          style={styles.postImage}
          source={{ uri: item.imageUrl, priority: FastImage.priority.normal }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
    ),
    [styles, navigateToPostDetail],
  );

  // ── Empty grid ─────────────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () =>
      !initialLoading && !postsLoading ? (
        <View style={styles.emptyContainer}>
          <Icon name="camera-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you share photos, they will appear on your profile.
          </Text>
        </View>
      ) : null,
    [initialLoading, postsLoading, styles, theme],
  );

  // ── Loading gate ───────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderPostItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </View>
  );
};

// ─── Stat Item ──────────────────────────────────────────────────────────────────
const StatItem = React.memo(({ label, value, theme, onPress }) => (
  <TouchableOpacity style={statStyles.wrapper} onPress={onPress} disabled={!onPress}>
    <Text style={[statStyles.value, { color: theme.textPrimary }]}>
      {formatCount(value)}
    </Text>
    <Text style={[statStyles.label, { color: theme.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
));

const formatCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const statStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', flex: 1 },
  value: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 12, marginTop: 2 },
});

// ─── Styles factory ─────────────────────────────────────────────────────────────
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    /* ── Top bar ── */
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    username: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    /* ── Header / avatar / stats ── */
    headerContainer: {
      paddingBottom: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    editAvatarIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    statsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginLeft: 20,
    },
    /* ── Bio ── */
    bioContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    displayName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 2,
    },
    bio: {
      fontSize: 14,
      color: theme.textPrimary,
      lineHeight: 18,
    },
    /* ── Edit button ── */
    editProfileBtn: {
      marginHorizontal: 16,
      marginBottom: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      backgroundColor: theme.surface,
    },
    editProfileText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    /* ── Grid header ── */
    gridHeader: {
      alignItems: 'center',
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    /* ── Post thumbs ── */
    postThumb: {
      width: POST_SIZE,
      height: POST_SIZE,
    },
    postImage: {
      flex: 1,
      margin: 0.5,
    },
    /* ── Empty ── */
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

export default React.memo(ProfileScreen);
