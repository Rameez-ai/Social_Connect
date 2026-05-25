/**
 * CreatePostScreen.js
 * 
 * Screen for creating a new post with text and optional image.
 * Features:
 * - Header with 'Create Post' title + close button
 * - User avatar + name display
 * - Multi-line text input for post content
 * - Image picker (camera + gallery options)
 * - Image preview with remove button
 * - Character count indicator (max 2200 chars, like Instagram)
 * - 'Share' button (disabled until content is entered)
 * - Upload flow: compress image → upload to storage → create post doc
 * - Loading overlay during upload
 * - Uses react-native-image-picker for image selection
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import { useTheme } from '../../utils/theme';
import { storageService } from '../../services/storageService';
import { postService } from '../../services/postService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const { width } = Dimensions.get('window');
const MAX_CHARS = 2200;

const CreatePostScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ─── Local State ──────────────────────────────────────────
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // ─── Derived State ────────────────────────────────────────
  /** Whether the Share button should be enabled */
  const canShare = useMemo(
    () => content.trim().length > 0 || selectedImage !== null,
    [content, selectedImage]
  );

  /** Character count display color */
  const charCountColor = useMemo(() => {
    const remaining = MAX_CHARS - content.length;
    if (remaining < 0) return '#FD1D1D';
    if (remaining < 100) return '#F77737';
    return theme.textSecondary;
  }, [content.length, theme.textSecondary]);

  // ─── Image Picker Options ────────────────────────────────
  const imagePickerOptions = {
    mediaType: 'photo',
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.8,
    includeBase64: false,
  };

  // ─── Handlers ─────────────────────────────────────────────

  /** Close the create post screen */
  const handleClose = useCallback(() => {
    if (content.trim().length > 0 || selectedImage) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard this post?',
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
  }, [content, selectedImage, navigation]);

  /** Open the image source picker (camera or gallery) */
  const handleAddImage = useCallback(() => {
    Alert.alert('Add Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          try {
            const result = await launchCamera(imagePickerOptions);
            if (result.assets && result.assets.length > 0) {
              setSelectedImage(result.assets[0]);
            }
          } catch (err) {
            setToastMessage('Failed to open camera.');
            setToastType('error');
            setToastVisible(true);
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          try {
            const result = await launchImageLibrary(imagePickerOptions);
            if (result.assets && result.assets.length > 0) {
              setSelectedImage(result.assets[0]);
            }
          } catch (err) {
            setToastMessage('Failed to open photo library.');
            setToastType('error');
            setToastVisible(true);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  /** Remove the selected image */
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  /**
   * Share/upload the post.
   * Flow: compress image → upload to Firebase Storage → create Firestore doc.
   */
  const handleShare = useCallback(async () => {
    if (!canShare) return;

    // Validate character limit
    if (content.length > MAX_CHARS) {
      setToastMessage(`Post exceeds the ${MAX_CHARS} character limit.`);
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl = null;

      // Step 1: Compress and upload image if selected
      if (selectedImage) {
        // Compress the image
        const compressedImage = await storageService.compressImage(
          selectedImage.uri
        );

        // Upload to Firebase Storage
        imageUrl = await storageService.uploadImage(
          compressedImage.uri || compressedImage,
          `posts/${user.uid}/${Date.now()}`,
          (progress) => setUploadProgress(progress)
        );
      }

      // Step 2: Create the post document in Firestore
      await postService.createPost({
        userId: user.uid,
        userName: user.displayName || user.name || 'User',
        userAvatar: user.photoURL || user.avatar || null,
        content: content.trim(),
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      // Step 3: Show success and navigate back
      setToastMessage('Post shared successfully!');
      setToastType('success');
      setToastVisible(true);

      // Short delay so user sees success toast
      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (err) {
      console.error('Error creating post:', err);
      setToastMessage(err.message || 'Failed to share post. Please try again.');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setUploading(false);
    }
  }, [canShare, content, selectedImage, user, navigation]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Loading overlay during upload */}
      {uploading && (
        <View style={styles.uploadOverlay}>
          <View
            style={[
              styles.uploadCard,
              { backgroundColor: theme.card || theme.surface },
            ]}
          >
            <ActivityIndicator size="large" color="#833AB4" />
            <Text style={[styles.uploadText, { color: theme.text }]}>
              {selectedImage
                ? `Uploading... ${Math.round(uploadProgress * 100)}%`
                : 'Creating post...'}
            </Text>
            {/* Progress bar */}
            {selectedImage && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${uploadProgress * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Toast messages */}
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
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Icon name="close" size={28} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Create Post
        </Text>

        <TouchableOpacity
          onPress={handleShare}
          disabled={!canShare || uploading}
          style={[
            styles.shareButton,
            (!canShare || uploading) && styles.shareButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.shareButtonText,
              (!canShare || uploading) && styles.shareButtonTextDisabled,
            ]}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── User Info ─────────────────────────────── */}
          <View style={styles.userInfo}>
            {user?.photoURL || user?.avatar ? (
              <FastImage
                style={styles.avatar}
                source={{ uri: user.photoURL || user.avatar }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.isDark ? '#2A2A3E' : '#E8E0F0' },
                ]}
              >
                <Icon name="person" size={22} color="#833AB4" />
              </View>
            )}
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.displayName || user?.name || 'User'}
            </Text>
          </View>

          {/* ─── Text Input ────────────────────────────── */}
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.placeholder}
            multiline
            maxLength={MAX_CHARS + 50} // slight buffer
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            autoFocus
          />

          {/* ─── Character Count ───────────────────────── */}
          <View style={styles.charCountContainer}>
            <Text style={[styles.charCount, { color: charCountColor }]}>
              {content.length}/{MAX_CHARS}
            </Text>
          </View>

          {/* ─── Image Preview ─────────────────────────── */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Icon name="close-circle" size={28} color="#FD1D1D" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ─── Bottom Toolbar ──────────────────────────── */}
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddImage}
          >
            <Icon name="image-outline" size={24} color="#833AB4" />
            <Text style={[styles.toolbarText, { color: theme.textSecondary }]}>
              Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddImage}
          >
            <Icon name="camera-outline" size={24} color="#833AB4" />
            <Text style={[styles.toolbarText, { color: theme.textSecondary }]}>
              Camera
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
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
  shareButton: {
    backgroundColor: '#833AB4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonDisabled: {
    backgroundColor: '#B8B8B8',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shareButtonTextDisabled: {
    color: '#E0E0E0',
  },

  // User info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },

  // Text input
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    paddingVertical: 8,
  },

  // Character count
  charCountContainer: {
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Image preview
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
  },

  // Bottom toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  toolbarText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Upload overlay
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  uploadCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '75%',
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#833AB4',
    borderRadius: 2,
  },
});

export default React.memo(CreatePostScreen);
