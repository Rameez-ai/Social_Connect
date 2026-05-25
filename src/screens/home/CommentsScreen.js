/**
 * CommentsScreen.js
 * 
 * Dedicated comments screen for viewing and adding comments to a post.
 * Features:
 * - Header with 'Comments' title + back button
 * - FlatList of CommentItem components
 * - Text input + send button at bottom (KeyboardAvoidingView)
 * - Real-time updates via Firestore onSnapshot
 * - EmptyState when no comments
 * - Loading state during initial fetch
 * - Uses commentService for all operations
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
import { useTheme } from '../../utils/theme';
import { commentService } from '../../services/commentService';
import CommentItem from '../../components/comment/CommentItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

const CommentsScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector((state) => state.auth);

  // ─── Route Params ─────────────────────────────────────────
  const { postId } = route.params;

  // ─── Refs ─────────────────────────────────────────────────
  const inputRef = useRef(null);
  const flatListRef = useRef(null);

  // ─── Local State ──────────────────────────────────────────
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Real-time Comments Subscription ─────────────────────
  useEffect(() => {
    let unsubscribe;

    try {
      /**
       * Subscribe to real-time comment updates using Firestore onSnapshot.
       * Updates the comments list whenever changes occur.
       */
      unsubscribe = commentService.subscribeToComments(
        postId,
        (updatedComments) => {
          setComments(updatedComments);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error subscribing to comments:', err);
      setToastMessage('Failed to load comments.');
      setToastVisible(true);
      setLoading(false);
    }

    // Cleanup: unsubscribe from onSnapshot on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [postId]);

  // ─── Handlers ─────────────────────────────────────────────

  /** Navigate back to previous screen */
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /** Navigate to a user's profile screen */
  const handleUserPress = useCallback(
    (userId) => {
      navigation.navigate('Profile', { userId });
    },
    [navigation]
  );

  /**
   * Submit a new comment.
   * Creates a comment document in Firestore via commentService.
   */
  const handleSubmitComment = useCallback(async () => {
    const trimmedText = commentText.trim();
    if (!trimmedText || submitting) return;

    setSubmitting(true);
    Keyboard.dismiss();

    try {
      await commentService.addComment({
        postId,
        userId: user.uid,
        userName: user.displayName || user.name || 'User',
        userAvatar: user.photoURL || user.avatar || null,
        text: trimmedText,
      });

      setCommentText('');

      // Scroll to the bottom to show the new comment
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (err) {
      console.error('Error adding comment:', err);
      setToastMessage('Failed to post comment. Please try again.');
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  }, [commentText, submitting, postId, user]);

  /**
   * Delete a comment (only for the comment author).
   */
  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await commentService.deleteComment(postId, commentId);
      } catch (err) {
        console.error('Error deleting comment:', err);
        setToastMessage('Failed to delete comment.');
        setToastVisible(true);
      }
    },
    [postId]
  );

  // ─── Render Functions ─────────────────────────────────────

  /** Render each comment */
  const renderComment = useCallback(
    ({ item }) => (
      <CommentItem
        comment={item}
        currentUserId={user?.uid}
        onUserPress={handleUserPress}
        onDelete={handleDeleteComment}
      />
    ),
    [user?.uid, handleUserPress, handleDeleteComment]
  );

  /** Unique key for each comment */
  const keyExtractor = useCallback((item) => item.id, []);

  /** Render separator between comments */
  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: theme.border }]}
      />
    ),
    [theme.border]
  );

  /** Render empty state when no comments */
  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="chatbubbles-outline"
        title="No comments yet"
        message="Be the first to share your thoughts!"
      />
    ),
    []
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
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <LoadingSpinner />
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Comments
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── Comments List + Input ───────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Comments FlatList */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            comments.length === 0 && styles.emptyListContent,
          ]}
        />

        {/* ─── Comment Input Bar ─────────────────────── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
            },
          ]}
        >
          {/* User avatar */}
          {user?.photoURL || user?.avatar ? (
            <FastImage
              style={styles.inputAvatar}
              source={{ uri: user.photoURL || user.avatar }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View
              style={[
                styles.inputAvatar,
                styles.inputAvatarPlaceholder,
                { backgroundColor: theme.isDark ? '#2A2A3E' : '#E8E0F0' },
              ]}
            >
              <Icon name="person" size={16} color="#833AB4" />
            </View>
          )}

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
            placeholder="Write a comment..."
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
              (!commentText.trim() || submitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#833AB4" />
            ) : (
              <Icon
                name="send"
                size={22}
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
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Input bar at bottom
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    marginBottom: 4,
  },
  inputAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
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

export default React.memo(CommentsScreen);
