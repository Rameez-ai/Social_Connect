/**
 * PostDetailScreen.js
 * 
 * Full view of a single post with its comments.
 * Features:
 * - Full PostCard component at top
 * - Comments section with FlatList
 * - Fixed comment input at bottom
 * - Real-time comments via subscribeToComments (onSnapshot)
 * - Like/unlike functionality
 * - Navigate to user profile on avatar/name tap
 * - Pull-to-refresh for comments
 * - Loading state + error handling
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from '../../utils/theme';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/comment/CommentItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

// Enable relative time formatting
dayjs.extend(relativeTime);

const PostDetailScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector((state) => state.auth);

  // ─── Route Params ─────────────────────────────────────────
  const { postId } = route.params;

  // ─── Refs ─────────────────────────────────────────────────
  const commentInputRef = useRef(null);

  // ─── Local State ──────────────────────────────────────────
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Fetch Post Data ─────────────────────────────────────
  useEffect(() => {
    let unsubscribePost;
    let unsubscribeComments;

    const fetchData = async () => {
      try {
        // Subscribe to post updates in real-time
        unsubscribePost = postService.subscribeToPost(postId, (updatedPost) => {
          setPost(updatedPost);
          setLoading(false);
        });

        // Subscribe to comments in real-time
        unsubscribeComments = commentService.subscribeToComments(
          postId,
          (updatedComments) => {
            setComments(updatedComments);
          }
        );
      } catch (err) {
        console.error('Error fetching post details:', err);
        setToastMessage('Failed to load post.');
        setToastVisible(true);
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribePost) unsubscribePost();
      if (unsubscribeComments) unsubscribeComments();
    };
  }, [postId]);

  // ─── Handlers ─────────────────────────────────────────────

  /** Navigate back */
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /** Navigate to a user's profile */
  const handleUserPress = useCallback(
    (userId) => {
      navigation.navigate('Profile', { userId });
    },
    [navigation]
  );

  /** Toggle like/unlike on the post */
  const handleLikeToggle = useCallback(async () => {
    if (!post || !user) return;
    try {
      await postService.toggleLike(postId, user.uid);
    } catch (err) {
      console.error('Error toggling like:', err);
      setToastMessage('Failed to update like.');
      setToastVisible(true);
    }
  }, [post, user, postId]);

  /** Submit a new comment */
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    Keyboard.dismiss();

    try {
      await commentService.addComment({
        postId,
        userId: user.uid,
        userName: user.displayName || user.name || 'User',
        userAvatar: user.photoURL || user.avatar || null,
        text: commentText.trim(),
      });

      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setToastMessage('Failed to post comment. Please try again.');
      setToastVisible(true);
    } finally {
      setSubmittingComment(false);
    }
  }, [commentText, submittingComment, postId, user]);

  /** Focus the comment input */
  const handleCommentPress = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  // ─── Render Functions ─────────────────────────────────────

  /** Render the post as the list header */
  const renderListHeader = useCallback(() => {
    if (!post) return null;

    return (
      <View>
        {/* Full post card */}
        <PostCard
          post={post}
          currentUserId={user?.uid}
          onUserPress={handleUserPress}
          onLikePress={handleLikeToggle}
          onCommentPress={handleCommentPress}
          showFullContent
        />

        {/* Comments header */}
        <View
          style={[
            styles.commentsHeader,
            { borderTopColor: theme.border },
          ]}
        >
          <Text style={[styles.commentsTitle, { color: theme.text }]}>
            Comments ({comments.length})
          </Text>
        </View>
      </View>
    );
  }, [post, user, comments.length, theme, handleUserPress, handleLikeToggle, handleCommentPress]);

  /** Render each comment item */
  const renderComment = useCallback(
    ({ item }) => (
      <CommentItem
        comment={item}
        currentUserId={user?.uid}
        onUserPress={handleUserPress}
      />
    ),
    [user?.uid, handleUserPress]
  );

  /** Unique key for comments */
  const keyExtractor = useCallback((item) => item.id, []);

  /** Empty comments state */
  const renderEmptyComments = useCallback(
    () => (
      <View style={styles.emptyComments}>
        <Icon
          name="chatbubble-outline"
          size={40}
          color={theme.textSecondary}
        />
        <Text
          style={[styles.emptyCommentsText, { color: theme.textSecondary }]}
        >
          No comments yet. Be the first!
        </Text>
      </View>
    ),
    [theme.textSecondary]
  );

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <LoadingSpinner />
      </View>
    );
  }

  // ─── Post Not Found ──────────────────────────────────────
  if (!post) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Post not found"
          message="This post may have been deleted."
          actionLabel="Go Back"
          onAction={handleGoBack}
        />
      </View>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        onDismiss={() => setToastVisible(false)}
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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── Content ─────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComments}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* ─── Comment Input (fixed at bottom) ───────── */}
        <View
          style={[
            styles.commentInputContainer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
            },
          ]}
        >
          {/* Current user avatar */}
          {user?.photoURL || user?.avatar ? (
            <FastImage
              style={styles.commentAvatar}
              source={{ uri: user.photoURL || user.avatar }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View
              style={[
                styles.commentAvatar,
                styles.commentAvatarPlaceholder,
                { backgroundColor: theme.isDark ? '#2A2A3E' : '#E8E0F0' },
              ]}
            >
              <Icon name="person" size={16} color="#833AB4" />
            </View>
          )}

          {/* Text input */}
          <TextInput
            ref={commentInputRef}
            style={[
              styles.commentInput,
              {
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.placeholder}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || submittingComment) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#833AB4" />
            ) : (
              <Icon
                name="send"
                size={20}
                color={commentText.trim() ? '#833AB4' : theme.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // List
  listContent: {
    paddingBottom: 16,
  },

  // Comments section header
  commentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Empty comments
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 14,
    marginTop: 10,
  },

  // Comment input bar
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    marginBottom: 4,
  },
  commentAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 38,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default React.memo(PostDetailScreen);
