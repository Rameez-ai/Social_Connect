/**
 * UserProfileScreen.js
 * --------------------
 * Displays another user's profile with follow/unfollow and message actions.
 * Receives { userId } via route params.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { useTheme } from '../../utils/theme';
import { fetchUserPosts } from '../../redux/slices/postsSlice';

// ─── Constants ──────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_SIZE = SCREEN_WIDTH / 3;
const AVATAR_SIZE = 90;
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/cccccc/969696?text=User';

// ─── Component ──────────────────────────────────────────────────────────────────
const UserProfileScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { userId } = route.params;

  // Redux
  const currentUser = useSelector((state) => state.auth.user);
  const { userPosts } = useSelector((state) => state.posts);

  // Local state
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const posts = useMemo(() => userPosts[userId] ?? [], [userPosts, userId]);
  const postsCount = posts.length;
  const followersCount = profileUser?.followersCount ?? 0;
  const followingCount = profileUser?.followingCount ?? 0;

  // ── Fetch user profile ──────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (doc.exists) {
        setProfileUser({ uid: doc.id, ...doc.data() });
      }
    } catch (error) {
      console.warn('UserProfileScreen – loadProfile error:', error);
    }
  }, [userId]);

  // ── Check follow status ─────────────────────────────────────────────────────
  const checkFollowStatus = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const doc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('following')
        .doc(userId)
        .get();
      setIsFollowing(doc.exists);
    } catch (error) {
      console.warn('UserProfileScreen – checkFollowStatus error:', error);
    }
  }, [currentUser?.uid, userId]);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      await Promise.all([
        loadProfile(),
        checkFollowStatus(),
        dispatch(fetchUserPosts(userId)).unwrap().catch(() => {}),
      ]);
      setInitialLoading(false);
    })();
  }, [loadProfile, checkFollowStatus, dispatch, userId]);

  // ── Pull-to-refresh ─────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadProfile(),
      checkFollowStatus(),
      dispatch(fetchUserPosts(userId)).unwrap().catch(() => {}),
    ]);
    setRefreshing(false);
  }, [loadProfile, checkFollowStatus, dispatch, userId]);

  // ── Follow / Unfollow ───────────────────────────────────────────────────────
  const handleFollowToggle = useCallback(async () => {
    if (!currentUser?.uid || followLoading) return;
    setFollowLoading(true);

    const batch = firestore().batch();
    const followingRef = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('following')
      .doc(userId);
    const followerRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('followers')
      .doc(currentUser.uid);
    const currentUserRef = firestore().collection('users').doc(currentUser.uid);
    const targetUserRef = firestore().collection('users').doc(userId);

    try {
      if (isFollowing) {
        // Un-follow
        batch.delete(followingRef);
        batch.delete(followerRef);
        batch.update(currentUserRef, {
          followingCount: firestore.FieldValue.increment(-1),
        });
        batch.update(targetUserRef, {
          followersCount: firestore.FieldValue.increment(-1),
        });
        await batch.commit();
        setIsFollowing(false);
        setProfileUser((prev) =>
          prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount ?? 1) - 1) } : prev,
        );
      } else {
        // Follow
        batch.set(followingRef, { createdAt: firestore.FieldValue.serverTimestamp() });
        batch.set(followerRef, { createdAt: firestore.FieldValue.serverTimestamp() });
        batch.update(currentUserRef, {
          followingCount: firestore.FieldValue.increment(1),
        });
        batch.update(targetUserRef, {
          followersCount: firestore.FieldValue.increment(1),
        });
        await batch.commit();
        setIsFollowing(true);
        setProfileUser((prev) =>
          prev ? { ...prev, followersCount: (prev.followersCount ?? 0) + 1 } : prev,
        );
      }
    } catch (error) {
      console.warn('UserProfileScreen – follow toggle error:', error);
      Alert.alert('Error', 'Could not update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  }, [currentUser?.uid, userId, isFollowing, followLoading]);

  // ── Navigate to chat ────────────────────────────────────────────────────────
  const handleMessage = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      // Check if a conversation already exists between these two users
      const snapshot = await firestore()
        .collection('conversations')
        .where('participants', 'array-contains', currentUser.uid)
        .get();

      let conversationId = null;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(userId)) {
          conversationId = doc.id;
        }
      });

      if (conversationId) {
        navigation.navigate('ChatThread', {
          conversationId,
          otherUser: profileUser,
        });
      } else {
        // Create a new conversation
        const newConvoRef = await firestore().collection('conversations').add({
          participants: [currentUser.uid, userId],
          lastMessage: '',
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        navigation.navigate('ChatThread', {
          conversationId: newConvoRef.id,
          otherUser: profileUser,
        });
      }
    } catch (error) {
      console.warn('UserProfileScreen – handleMessage error:', error);
      Alert.alert('Error', 'Could not open chat. Please try again.');
    }
  }, [currentUser?.uid, userId, profileUser, navigation]);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Header ──────────────────────────────────────────────────────────────────
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.username} numberOfLines={1}>
            {profileUser?.username ?? 'username'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar + stats */}
        <View style={styles.profileRow}>
          <FastImage
            style={styles.avatar}
            source={{
              uri: profileUser?.profilePicture || DEFAULT_AVATAR,
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.statsContainer}>
            <StatItem label="Posts" value={postsCount} theme={theme} />
            <StatItem label="Followers" value={followersCount} theme={theme} />
            <StatItem label="Following" value={followingCount} theme={theme} />
          </View>
        </View>

        {/* Name & bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.displayName}>{profileUser?.displayName ?? ''}</Text>
          {profileUser?.bio ? <Text style={styles.bio}>{profileUser.bio}</Text> : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isFollowing ? styles.followingBtn : styles.followBtn,
            ]}
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.actionBtnText,
                  isFollowing ? styles.followingBtnText : styles.followBtnText,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Grid icon */}
        <View style={styles.gridHeader}>
          <Icon name="grid-outline" size={22} color={theme.primary} />
        </View>
      </View>
    ),
    [
      styles,
      profileUser,
      postsCount,
      followersCount,
      followingCount,
      isFollowing,
      followLoading,
      handleFollowToggle,
      handleMessage,
      navigation,
      theme,
    ],
  );

  // ── Post item ───────────────────────────────────────────────────────────────
  const renderPostItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.postThumb}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        activeOpacity={0.85}
      >
        <FastImage
          style={styles.postImage}
          source={{ uri: item.imageUrl, priority: FastImage.priority.normal }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
    ),
    [styles, navigation],
  );

  // ── Empty ───────────────────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () =>
      !initialLoading ? (
        <View style={styles.emptyContainer}>
          <Icon name="camera-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
        </View>
      ) : null,
    [initialLoading, styles, theme],
  );

  // ── Loading gate ────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
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
const StatItem = React.memo(({ label, value, theme }) => (
  <View style={statStyles.wrapper}>
    <Text style={[statStyles.value, { color: theme.textPrimary }]}>
      {formatCount(value)}
    </Text>
    <Text style={[statStyles.label, { color: theme.textSecondary }]}>{label}</Text>
  </View>
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
    container: { flex: 1, backgroundColor: theme.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
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
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    /* ── Header ── */
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
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.primary,
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
    /* ── Action buttons ── */
    actionRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 36,
    },
    followBtn: {
      backgroundColor: theme.primary,
    },
    followingBtn: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },
    followBtnText: {
      color: '#fff',
    },
    followingBtnText: {
      color: theme.textPrimary,
    },
    messageBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    messageBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    /* ── Grid ── */
    gridHeader: {
      alignItems: 'center',
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
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
  });

export default React.memo(UserProfileScreen);
