/**
 * PostCard.js
 * 
 * Main post card component for the Social Connect feed.
 * Displays a user's post with avatar, text, optional image,
 * animated like button, comment count, and a three-dot menu
 * for the post owner (edit/delete).
 * 
 * Uses react-native-reanimated for the heart animation (spring scale + color).
 * Uses @d11/react-native-fast-image for performant image loading.
 * Uses dayjs for human-readable relative timestamps.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../utils/theme';

// Enable relative time plugin for dayjs (e.g., "5 minutes ago")
dayjs.extend(relativeTime);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Extracts initials from a display name for the avatar fallback.
 * @param {string} name - The user's display name.
 * @returns {string} Up to 2 uppercase initials.
 */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || '?';
};

/**
 * Formats a Firestore timestamp or JS Date into a relative time string.
 * @param {object|Date|number} timestamp - Firestore Timestamp, Date, or epoch ms.
 * @returns {string} Human-readable relative time (e.g., "2h ago").
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  // Handle Firestore Timestamp objects
  if (timestamp?.toDate) {
    return dayjs(timestamp.toDate()).fromNow();
  }
  // Handle epoch milliseconds or Date objects
  return dayjs(timestamp).fromNow();
};

const PostCard = ({
  post,
  onLike,
  onComment,
  onPress,
  onProfilePress,
  currentUserId,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Three-dot menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  // Whether the current user is the post owner
  const isOwnPost = post?.userId === currentUserId;

  // Whether the current user has liked this post
  const isLiked = post?.likes?.includes(currentUserId);

  // --- Like button animation values ---
  const likeScale = useSharedValue(1);
  const likeProgress = useSharedValue(isLiked ? 1 : 0);

  // Animated style for the heart icon: spring scale + color interpolation
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  /**
   * Handles the like button press:
   * 1. Triggers the spring scale animation (1 → 1.3 → 1)
   * 2. Toggles the color progress value
   * 3. Calls the parent onLike callback
   */
  const handleLike = useCallback(() => {
    // Spring scale animation: pop out to 1.3 then settle back to 1.0
    likeScale.value = withSpring(1.3, {
      damping: 4,
      stiffness: 300,
    }, () => {
      likeScale.value = withSpring(1, {
        damping: 6,
        stiffness: 200,
      });
    });

    // Toggle color progress
    likeProgress.value = withTiming(isLiked ? 0 : 1, { duration: 200 });

    // Notify parent
    if (onLike) onLike(post);
  }, [isLiked, onLike, post, likeScale, likeProgress]);

  /**
   * Handles comment icon press.
   */
  const handleComment = useCallback(() => {
    if (onComment) onComment(post);
  }, [onComment, post]);

  /**
   * Handles post card press (navigate to detail).
   */
  const handlePress = useCallback(() => {
    if (onPress) onPress(post);
  }, [onPress, post]);

  /**
   * Handles profile avatar/name press.
   */
  const handleProfilePress = useCallback(() => {
    if (onProfilePress) onProfilePress(post?.userId);
  }, [onProfilePress, post]);

  /**
   * Renders the avatar — either a FastImage or a fallback with initials.
   */
  const renderAvatar = () => {
    if (post?.userAvatar) {
      return (
        <FastImage
          style={styles.avatar}
          source={{
            uri: post.userAvatar,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    }
    // Fallback: colored circle with initials
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>
          {getInitials(post?.userName)}
        </Text>
      </View>
    );
  };

  // Guard against null/undefined post
  if (!post) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={styles.container}
    >
      {/* --- Header: Avatar, Username, Timestamp, Menu --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          {renderAvatar()}
          <View style={styles.userTextContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {post.userName || 'Unknown User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Three-dot menu for own posts */}
        {isOwnPost && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="ellipsis-horizontal"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* --- Post Text --- */}
      {post.text ? (
        <Text style={styles.postText}>{post.text}</Text>
      ) : null}

      {/* --- Post Image --- */}
      {post.imageUrl ? (
        <FastImage
          style={styles.postImage}
          source={{
            uri: post.imageUrl,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : null}

      {/* --- Action Bar: Like, Comment --- */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          {/* Like Button with animated heart */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Animated.View style={animatedHeartStyle}>
              <Icon
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? theme.colors.like : theme.colors.text}
              />
            </Animated.View>
            {post.likeCount > 0 && (
              <Text style={styles.actionCount}>{post.likeCount}</Text>
            )}
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleComment}
            activeOpacity={0.7}
          >
            <Icon
              name="chatbubble-outline"
              size={22}
              color={theme.colors.text}
            />
            {post.commentCount > 0 && (
              <Text style={styles.actionCount}>{post.commentCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Three-dot Menu Modal (Edit / Delete) --- */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                if (post.onEdit) post.onEdit(post);
              }}
            >
              <Icon name="create-outline" size={20} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                if (post.onDelete) post.onDelete(post);
              }}
            >
              <Icon name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.menuItemText, { color: theme.colors.error }]}>
                Delete Post
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
};

/**
 * Creates theme-aware styles for the PostCard component.
 * @param {object} theme - The current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    // --- Header ---
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    avatarFallback: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    userTextContainer: {
      marginLeft: 10,
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    menuButton: {
      padding: 6,
    },
    // --- Post Content ---
    postText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.text,
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    postImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH, // Square aspect ratio like Instagram
      backgroundColor: theme.colors.surface,
    },
    // --- Action Bar ---
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 18,
    },
    actionCount: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginLeft: 5,
    },
    // --- Menu Modal ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      width: SCREEN_WIDTH * 0.7,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
    },
    menuDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });

// Memoize the component to prevent unnecessary re-renders
export default React.memo(PostCard);
