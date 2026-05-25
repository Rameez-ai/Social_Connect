/**
 * CommentItem.js
 * 
 * Displays a single comment in a compact layout.
 * Shows the commenter's avatar, username (bold), comment text,
 * and a relative timestamp.
 * 
 * Wrapped with React.memo for performance in long comment lists.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../utils/theme';

dayjs.extend(relativeTime);

/**
 * Extracts up to 2 initials from a display name.
 * @param {string} name - Display name.
 * @returns {string} Uppercase initials.
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
 * Formats a timestamp into relative time (e.g., "3m ago").
 * @param {object|Date|number} timestamp - Firestore Timestamp, Date, or epoch.
 * @returns {string} Relative time string.
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp?.toDate) return dayjs(timestamp.toDate()).fromNow();
  return dayjs(timestamp).fromNow();
};

const CommentItem = ({ comment, onProfilePress }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * Handles avatar/username press to navigate to the commenter's profile.
   */
  const handleProfilePress = useCallback(() => {
    if (onProfilePress) onProfilePress(comment?.userId);
  }, [onProfilePress, comment?.userId]);

  if (!comment) return null;

  /**
   * Renders the user avatar — FastImage or initials fallback.
   */
  const renderAvatar = () => {
    if (comment.userAvatar) {
      return (
        <FastImage
          style={styles.avatar}
          source={{
            uri: comment.userAvatar,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    }
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>
          {getInitials(comment.userName)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
        {renderAvatar()}
      </TouchableOpacity>

      {/* Comment body */}
      <View style={styles.contentContainer}>
        <Text style={styles.commentText}>
          {/* Username inline with comment text for a compact look */}
          <Text
            style={styles.userName}
            onPress={handleProfilePress}
          >
            {comment.userName || 'Unknown'}{' '}
          </Text>
          {comment.text}
        </Text>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatTimestamp(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
};

/**
 * Creates theme-aware styles for the CommentItem.
 * @param {object} theme - Current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignItems: 'flex-start',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
      marginTop: 2,
    },
    avatarFallback: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    contentContainer: {
      flex: 1,
    },
    commentText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.text,
    },
    userName: {
      fontWeight: '700',
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

export default React.memo(CommentItem);
