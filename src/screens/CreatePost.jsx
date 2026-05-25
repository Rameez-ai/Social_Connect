import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomButton,
  Header,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { createPostValidationSchema } from '../utils/validation';
import { setLoading, setError, addPost } from '../redux/slices/postSlice';
import { postService } from '../services/postService';

const CreatePost = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.posts);
  const [selectedImage, setSelectedImage] = useState(null);
  const [privacy, setPrivacy] = useState('Public');

  const handleCreatePost = async (values) => {
    try {
      dispatch(setLoading(true));
      const postData = {
        text: values.text,
        image: selectedImage,
        userId: user?.uid,
        userName: user?.displayName || 'Anonymous',
        userAvatar: user?.photoURL,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        privacy,
      };
      const newPost = await postService.createPost(postData);
      dispatch(addPost(newPost));
      navigation.goBack();
    } catch (err) {
      dispatch(setError(err.message || 'Failed to create post'));
    }
  };

  const handleSelectImage = () => {
    // In a real app, you'd use react-native-image-picker
    // For now, we'll just show a placeholder
    setSelectedImage('https://via.placeholder.com/300x300');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header
        title="Create Post"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <View style={styles.userSection}>
          <Image
            source={{ uri: user?.photoURL || 'https://via.placeholder.com/48' }}
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <TouchableOpacity style={styles.privacySelector}>
              <Text style={styles.privacyText}>{privacy}</Text>
              <Text style={styles.privacyArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <Formik
          initialValues={{ text: '' }}
          validationSchema={createPostValidationSchema}
          onSubmit={handleCreatePost}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textTertiary}
                value={values.text}
                onChangeText={handleChange('text')}
                onBlur={handleBlur('text')}
                multiline
                numberOfLines={6}
              />
              {touched.text && errors.text && (
                <Text style={styles.error}>{errors.text}</Text>
              )}

              {/* Image Upload */}
              <TouchableOpacity
                style={styles.imageUploadArea}
                onPress={handleSelectImage}
              >
                {selectedImage ? (
                  <>
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Text style={styles.removeText}>✕ Remove</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>📸</Text>
                    <Text style={styles.uploadText}>Add high-resolution images</Text>
                    <Text style={styles.uploadSubtext}>Drag and drop or click to browse</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionsBar}>
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>😊</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📍</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <Text style={styles.charCounter}>{values.text.length}/500</Text>
              </View>

              {/* Trending Topics */}
              <View style={styles.trendingContainer}>
                <Text style={styles.trendingTitle}>Trending Topics</Text>
                <View style={styles.tagsContainer}>
                  <TouchableOpacity style={styles.tag}>
                    <Text style={styles.tagText}>#Photography</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tag}>
                    <Text style={styles.tagText}>#WebDesign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tag}>
                    <Text style={styles.tagText}>#Connectivity</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tag}>
                    <Text style={styles.tagText}>#SocialConnect</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Post Button */}
              <CustomButton
                title="Post"
                onPress={handleSubmit}
                loading={isLoading}
                style={styles.postButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
  },
  privacySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginRight: SPACING.sm,
  },
  privacyArrow: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: SPACING.md,
  },
  error: {
    color: colors.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: colors.surface,
    minHeight: 150,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  removeImageButton: {
    backgroundColor: colors.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  removeText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  uploadSubtext: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: SPACING.lg,
  },
  actionItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  charCounter: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
    marginRight: SPACING.md,
  },
  trendingContainer: {
    marginBottom: SPACING.lg,
  },
  trendingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  postButton: {
    marginTop: SPACING.lg,
  },
});

export default CreatePost;
