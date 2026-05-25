/**
 * ConversationItem.js
 * 
 * Displays a single conversation in the chat list.
 * Shows the other participant's avatar, name, a truncated
 * last-message preview, relative timestamp, and an unread
 * indicator dot when there are new messages.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../utils/theme';

dayjs.extend(relativeTime);

/**
 * Extracts up to 2 initials from a name.
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
 * Formats a timestamp into a short relative string.
 * @param {object|Date|number} timestamp
 * @returns {string} Relative time (e.g., "5m ago").
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp?.toDate) return dayjs(timestamp.toDate()).fromNow();
  return dayjs(timestamp).fromNow();
};

const ConversationItem = ({ conversation, currentUserId, onPress }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Determine the "other" user in the conversation
  // Expects conversation.participants as an array of user objects,
  // or conversation.otherUser as a pre-resolved object.
  const otherUser = useMemo(() => {
    if (conversation?.otherUser) return conversation.otherUser;
    if (conversation?.participants) {
      return conversation.participants.find((p) => p.id !== currentUserId) || {};
    }
    return {};
  }, [conversation, currentUserId]);

  // Whether the conversation has unread messages for the current user
  const hasUnread = useMemo(() => {
    if (conversation?.unreadCount && conversation.unreadCount > 0) return true;
    if (conversation?.lastMessage?.senderId !== currentUserId && !conversation?.lastMessage?.read) {
      return true;
    }
    return false;
  }, [conversation, currentUserId]);

  /**
   * Handles the item press to open the conversation.
   */
  const handlePress = useCallback(() => {
    if (onPress) onPress(conversation);
  }, [onPress, conversation]);

  if (!conversation) return null;

  /**
   * Renders the other user's avatar.
   */
  const renderAvatar = () => {
    const avatarUri = otherUser.avatar || otherUser.profileImage;
    if (avatarUri) {
      return (
        <FastImage
          style={styles.avatar}
          source={{
            uri: avatarUri,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    }
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>
          {getInitials(otherUser.displayName || otherUser.name)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar with optional unread indicator */}
      <View style={styles.avatarWrapper}>
        {renderAvatar()}
        {hasUnread && <View style={styles.unreadDot} />}
      </View>

      {/* Conversation details */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text
            style={[styles.userName, hasUnread && styles.userNameUnread]}
            numberOfLines={1}
          >
            {otherUser.displayName || otherUser.name || 'Unknown User'}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
          </Text>
        </View>

        {/* Last message preview */}
        <Text
          style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
          numberOfLines={1}
        >
          {conversation.lastMessage?.text || 'Start a conversation'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Creates theme-aware styles for ConversationItem.
 * @param {object} theme - Current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    avatarFallback: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    unreadDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.card,
    },
    contentContainer: {
      flex: 1,
      marginLeft: 14,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    userNameUnread: {
      fontWeight: '700',
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    lastMessage: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    lastMessageUnread: {
      color: theme.colors.text,
      fontWeight: '600',
    },
  });

export default React.memo(ConversationItem);
