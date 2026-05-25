import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Formik } from 'formik';
import {
  Header,
  CustomButton,
  CustomInput,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { editProfileValidationSchema } from '../utils/validation';

const EditProfile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);

  const handleSaveProfile = (values) => {
    console.log('Saving profile:', values);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header
        title="Edit Profile"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture */}
        <View style={styles.profileImageSection}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageIcon}>📸</Text>
          </View>
          <CustomButton
            title="Change Photo"
            onPress={() => setProfileImage('https://via.placeholder.com/150')}
            size="sm"
            style={styles.changePhotoButton}
          />
        </View>

        {/* Form */}
        <Formik
          initialValues={{
            fullName: 'John Doe',
            email: 'john@example.com',
            bio: 'Digital nomad and UI explorer.',
            location: 'San Francisco, CA',
            website: 'www.example.com',
          }}
          validationSchema={editProfileValidationSchema}
          onSubmit={handleSaveProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && errors.fullName}
              />

              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                editable={false}
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.bioInput, touched.bio && errors.bio && styles.inputError]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.textTertiary}
                  value={values.bio}
                  onChangeText={handleChange('bio')}
                  onBlur={handleBlur('bio')}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.charCount}>{values.bio.length}/200</Text>
                {touched.bio && errors.bio && (
                  <Text style={styles.error}>{errors.bio}</Text>
                )}
              </View>

              <CustomInput
                label="Location"
                placeholder="City, Country"
                value={values.location}
                onChangeText={handleChange('location')}
              />

              <CustomInput
                label="Website"
                placeholder="https://example.com"
                value={values.website}
                onChangeText={handleChange('website')}
              />

              <CustomButton
                title="Save Changes"
                onPress={handleSubmit}
                style={styles.saveButton}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imageIcon: {
    fontSize: 40,
  },
  changePhotoButton: {
    width: 'auto',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  bioInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputError: {
    borderColor: colors.error,
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  error: {
    color: colors.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default EditProfile;
