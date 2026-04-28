import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { formatDate, formatNumber } from '../utils/helpers';

const PostItem = ({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
  liked = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreText}>...</Text>
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      <Text style={styles.postText}>{post.text}</Text>

      {/* Post Image */}
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
        />
      )}

      {/* Engagement Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>
          {formatNumber(post.likes)} {post.likes === 1 ? 'Like' : 'Likes'}
        </Text>
        <Text style={styles.statText}>
          {formatNumber(post.comments?.length || 0)} Comments
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike && onLike(post.id)}
        >
          <Text style={[styles.actionText, liked && styles.actionTextActive]}>
            ❤️ Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment && onComment(post.id)}
        >
          <Text style={styles.actionText}>💬 Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare && onShare(post.id)}
        >
          <Text style={styles.actionText}>↗️ Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  moreText: {
    fontSize: FONT_SIZES.xl,
    color: colors.textSecondary,
  },
  postText: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionTextActive: {
    color: colors.primary,
  },
});

export default PostItem;
