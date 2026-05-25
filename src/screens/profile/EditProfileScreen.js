/**
 * EditProfileScreen.js
 * --------------------
 * Allows the current user to update their profile picture, display name,
 * and bio.  Uses Formik + Yup for validation and Firestore for persistence.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import { useTheme } from '../../utils/theme';
import { updateUserProfile } from '../../redux/slices/authSlice';

// ─── Constants ──────────────────────────────────────────────────────────────────
const AVATAR_SIZE = 120;
const BIO_MAX = 150;
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/cccccc/969696?text=User';

// ─── Validation schema ─────────────────────────────────────────────────────────
const profileSchema = Yup.object().shape({
  displayName: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .required('Name is required'),
  bio: Yup.string().trim().max(BIO_MAX, `Bio must be at most ${BIO_MAX} characters`),
});

// ─── Component ──────────────────────────────────────────────────────────────────
const EditProfileScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const currentUser = useSelector((state) => state.auth.user);

  const [selectedImage, setSelectedImage] = useState(null); // local uri
  const [uploading, setUploading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Pick image ──────────────────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.length) return;

      const asset = result.assets[0];
      // Resize for storage efficiency
      const resized = await ImageResizer.createResizedImage(
        asset.uri,
        400,
        400,
        'JPEG',
        80,
        0,
      );
      setSelectedImage(resized.uri);
    } catch (error) {
      console.warn('EditProfileScreen – image pick error:', error);
      Alert.alert('Error', 'Could not select image. Please try again.');
    }
  }, []);

  // ── Upload avatar to Firebase Storage ───────────────────────────────────────
  const uploadAvatar = useCallback(
    async (localUri) => {
      const fileName = `avatars/${currentUser.uid}_${Date.now()}.jpg`;
      const ref = storage().ref(fileName);
      await ref.putFile(localUri);
      return ref.getDownloadURL();
    },
    [currentUser?.uid],
  );

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (values) => {
      setUploading(true);
      try {
        const updates = {
          displayName: values.displayName.trim(),
          bio: (values.bio ?? '').trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        // Upload new avatar if selected
        if (selectedImage) {
          const downloadUrl = await uploadAvatar(selectedImage);
          updates.profilePicture = downloadUrl;
        }

        // Persist to Firestore
        await firestore().collection('users').doc(currentUser.uid).update(updates);

        // Update Redux
        dispatch(updateUserProfile(updates));

        Alert.alert('Success', 'Profile updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.warn('EditProfileScreen – save error:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [selectedImage, uploadAvatar, currentUser?.uid, dispatch, navigation],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage}>
          <FastImage
            style={styles.avatar}
            source={{
              uri: selectedImage || currentUser?.profilePicture || DEFAULT_AVATAR,
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.avatarOverlay}>
            <Icon name="camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickImage}>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>

        {/* Form */}
        <Formik
          initialValues={{
            displayName: currentUser?.displayName ?? '',
            bio: currentUser?.bio ?? '',
          }}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit: formSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              {/* Display Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={theme.textSecondary}
                  value={values.displayName}
                  onChangeText={handleChange('displayName')}
                  onBlur={handleBlur('displayName')}
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={50}
                />
                {touched.displayName && errors.displayName ? (
                  <Text style={styles.errorText}>{errors.displayName}</Text>
                ) : null}
              </View>

              {/* Bio */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Bio</Text>
                  <Text style={styles.charCount}>
                    {values.bio.length}/{BIO_MAX}
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Write a short bio..."
                  placeholderTextColor={theme.textSecondary}
                  value={values.bio}
                  onChangeText={handleChange('bio')}
                  onBlur={handleBlur('bio')}
                  multiline
                  maxLength={BIO_MAX}
                  textAlignVertical="top"
                />
                {touched.bio && errors.bio ? (
                  <Text style={styles.errorText}>{errors.bio}</Text>
                ) : null}
              </View>

              {/* Save */}
              <TouchableOpacity
                style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
                onPress={formSubmit}
                disabled={uploading}
                activeOpacity={0.8}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles factory ─────────────────────────────────────────────────────────────
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    /* ── Header ── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    /* ── Avatar ── */
    scrollContent: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: 8,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    changePhotoText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 24,
    },
    /* ── Form ── */
    form: {
      width: '100%',
    },
    fieldGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 6,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    charCount: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    input: {
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.surface,
    },
    bioInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: '#FD1D1D',
      marginTop: 4,
    },
    /* ── Save ── */
    saveBtn: {
      marginTop: 8,
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
  });

export default React.memo(EditProfileScreen);
