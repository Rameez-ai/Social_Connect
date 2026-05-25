/**
 * EditPostScreen.js
 * 
 * Screen for editing an existing post's text content.
 * Features:
 * - Header with 'Edit Post' title + Cancel and Save buttons
 * - Pre-filled text input with the current post text
 * - Character count indicator
 * - Save button dispatches editPost action
 * - Loading state during save
 * - Success toast + navigate back on completion
 * - Full dark/light theme support
 */

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../utils/theme';
import { editPost } from '../../store/slices/postSlice';
import { postService } from '../../services/postService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const MAX_CHARS = 2200;

const EditPostScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ─── Route Params ─────────────────────────────────────────
  const { postId, currentText } = route.params;

  // ─── Local State ──────────────────────────────────────────
  const [content, setContent] = useState(currentText || '');
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(!currentText);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // ─── Derived State ────────────────────────────────────────
  /** Whether the content has changed from the original */
  const hasChanges = useMemo(
    () => content.trim() !== (currentText || '').trim(),
    [content, currentText]
  );

  /** Whether the Save button should be enabled */
  const canSave = useMemo(
    () => hasChanges && content.trim().length > 0 && content.length <= MAX_CHARS,
    [hasChanges, content]
  );

  /** Character count color based on remaining chars */
  const charCountColor = useMemo(() => {
    const remaining = MAX_CHARS - content.length;
    if (remaining < 0) return '#FD1D1D';
    if (remaining < 100) return '#F77737';
    return theme.textSecondary;
  }, [content.length, theme.textSecondary]);

  // ─── Fetch Post If Text Not Passed ────────────────────────
  useEffect(() => {
    /**
     * If currentText wasn't provided via route params,
     * fetch the post data from Firestore.
     */
    const fetchPost = async () => {
      if (currentText) return;
      try {
        const postData = await postService.getPost(postId);
        if (postData) {
          setContent(postData.content || '');
        }
      } catch (err) {
        console.error('Error fetching post for edit:', err);
        setToastType('error');
        setToastMessage('Failed to load post content.');
        setToastVisible(true);
      } finally {
        setFetchingPost(false);
      }
    };

    fetchPost();
  }, [postId, currentText]);

  // ─── Handlers ─────────────────────────────────────────────

  /** Cancel editing – confirm if changes were made */
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  /**
   * Save the edited post.
   * Dispatches the editPost thunk and navigates back on success.
   */
  const handleSave = useCallback(async () => {
    if (!canSave || loading) return;

    setLoading(true);
    try {
      await dispatch(
        editPost({
          postId,
          content: content.trim(),
          userId: user.uid,
        })
      ).unwrap();

      setToastType('success');
      setToastMessage('Post updated successfully!');
      setToastVisible(true);

      // Navigate back after a short delay so user sees the success toast
      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (err) {
      console.error('Error saving post:', err);
      setToastType('error');
      setToastMessage(err.message || 'Failed to save changes. Please try again.');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  }, [canSave, loading, dispatch, postId, content, user, navigation]);

  // ─── Loading State (fetching post) ────────────────────────
  if (fetchingPost) {
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

  // ─── Main Render ──────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Loading overlay during save */}
      {loading && <LoadingSpinner overlay />}

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
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
        {/* Cancel button */}
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={[styles.cancelText, { color: theme.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Edit Post
        </Text>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || loading}
          style={[
            styles.saveButton,
            (!canSave || loading) && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.saveText,
                (!canSave || loading) && styles.saveTextDisabled,
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Content ─────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info note */}
          <View
            style={[
              styles.infoBar,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(131, 58, 180, 0.1)'
                  : 'rgba(131, 58, 180, 0.06)',
              },
            ]}
          >
            <Icon name="information-circle-outline" size={18} color="#833AB4" />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              You can only edit the text content of your post.
            </Text>
          </View>

          {/* Text input area */}
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.placeholder}
            multiline
            textAlignVertical="top"
            autoFocus
            maxLength={MAX_CHARS + 50}
          />

          {/* Character count */}
          <View style={styles.charCountContainer}>
            <Text style={[styles.charCount, { color: charCountColor }]}>
              {content.length}/{MAX_CHARS}
            </Text>
          </View>

          {/* Changes indicator */}
          {hasChanges && (
            <View style={styles.changesIndicator}>
              <Icon name="pencil" size={14} color="#F77737" />
              <Text style={[styles.changesText, { color: theme.textSecondary }]}>
                You have unsaved changes
              </Text>
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
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
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#833AB4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B8B8B8',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveTextDisabled: {
    color: '#E0E0E0',
  },

  // Info bar
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },

  // Text input
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  // Character count
  charCountContainer: {
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Changes indicator
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  changesText: {
    fontSize: 12,
    marginLeft: 6,
    fontStyle: 'italic',
  },
});

export default React.memo(EditPostScreen);
