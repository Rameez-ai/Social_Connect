/**
 * UserCard.js
 * 
 * Displays a user search result or suggestion card.
 * Shows the user's avatar, display name, bio preview,
 * and a follow/unfollow button (hidden when viewing own card).
 * 
 * Wrapped with React.memo for list performance.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../utils/theme';

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

const UserCard = ({ user, onPress, onFollow, isFollowing, currentUserId }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Don't show the follow button for the current user's own card
  const isSelf = user?.id === currentUserId;

  /**
   * Handles the card press to navigate to the user's profile.
   */
  const handlePress = useCallback(() => {
    if (onPress) onPress(user);
  }, [onPress, user]);

  /**
   * Handles the follow/unfollow button press.
   */
  const handleFollow = useCallback(() => {
    if (onFollow) onFollow(user);
  }, [onFollow, user]);

  if (!user) return null;

  /**
   * Renders the user avatar — FastImage or initials fallback.
   */
  const renderAvatar = () => {
    if (user.avatar || user.profileImage) {
      return (
        <FastImage
          style={styles.avatar}
          source={{
            uri: user.avatar || user.profileImage,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    }
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>
          {getInitials(user.displayName || user.name)}
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
      {/* Avatar */}
      {renderAvatar()}

      {/* User Info: Name + Bio Preview */}
      <View style={styles.infoContainer}>
        <Text style={styles.displayName} numberOfLines={1}>
          {user.displayName || user.name || 'Unknown User'}
        </Text>
        {user.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        ) : null}
      </View>

      {/* Follow / Unfollow Button (hidden for self) */}
      {!isSelf && (
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing ? styles.followingButton : styles.notFollowingButton,
          ]}
          onPress={handleFollow}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing
                ? styles.followingButtonText
                : styles.notFollowingButtonText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/**
 * Creates theme-aware styles for the UserCard.
 * @param {object} theme - Current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
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
    infoContainer: {
      flex: 1,
      marginLeft: 12,
      marginRight: 10,
    },
    displayName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    bio: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
    },
    // --- Follow Button States ---
    followButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 90,
      alignItems: 'center',
    },
    notFollowingButton: {
      backgroundColor: theme.colors.primary,
    },
    followingButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    followButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    notFollowingButtonText: {
      color: '#FFFFFF',
    },
    followingButtonText: {
      color: theme.colors.text,
    },
  });

export default React.memo(UserCard);
