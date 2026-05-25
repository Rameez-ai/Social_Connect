/**
 * ForgotPasswordScreen.js
 * 
 * Clean, minimal password reset screen.
 * Features:
 * - Back button to return to Login
 * - Lock icon illustration at top
 * - 'Reset Password' title + description
 * - Email input with Formik validation
 * - 'Send Reset Link' button
 * - Success message after email is sent
 * - Full dark/light theme support
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../../utils/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

/**
 * Validation schema for forgot password form.
 * Only requires a valid email address.
 */
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPasswordScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();

  // ─── Local State ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // ─── Handlers ─────────────────────────────────────────────

  /**
   * Send password reset email via Firebase Auth.
   * Shows success state or error toast.
   */
  const handleResetPassword = useCallback(async (values) => {
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(values.email.trim());
      setSentEmail(values.email.trim());
      setEmailSent(true);
      setToastType('success');
      setToastMessage('Password reset email sent successfully!');
      setToastVisible(true);
    } catch (err) {
      let message = 'Failed to send reset email. Please try again.';
      // Firebase-specific error handling
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      setToastType('error');
      setToastMessage(message);
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Navigate back to the Login screen */
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ─── Render: Success State ────────────────────────────────
  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />

        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon
            name="arrow-back"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={styles.successContainer}>
          {/* Success icon */}
          <View style={styles.successIconCircle}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          </View>

          <Text style={[styles.successTitle, { color: theme.text }]}>
            Email Sent!
          </Text>
          <Text
            style={[styles.successDescription, { color: theme.textSecondary }]}
          >
            We've sent a password reset link to{' '}
            <Text style={styles.emailHighlight}>{sentEmail}</Text>. Please check
            your inbox and follow the instructions.
          </Text>

          {/* Back to Login button */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Resend link */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setEmailSent(false);
            }}
          >
            <Text style={[styles.resendText, { color: theme.textSecondary }]}>
              Didn't receive the email?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Render: Form State ───────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Loading overlay */}
      {loading && <LoadingSpinner overlay />}

      {/* Error toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Back Button ───────────────────────────── */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* ─── Illustration / Icon ───────────────────── */}
          <View style={styles.illustrationContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.isDark ? '#1E1E2E' : '#F0E6FF' },
              ]}
            >
              <Icon name="lock-closed" size={48} color="#833AB4" />
            </View>
          </View>

          {/* ─── Title & Description ───────────────────── */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Reset Password
            </Text>
            <Text
              style={[styles.description, { color: theme.textSecondary }]}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          {/* ─── Email Form ────────────────────────────── */}
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                {/* Email input */}
                <View style={styles.inputWrapper}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor:
                          touched.email && errors.email
                            ? '#FD1D1D'
                            : theme.border,
                      },
                    ]}
                  >
                    <Icon
                      name="mail-outline"
                      size={20}
                      color={theme.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Email address"
                      placeholderTextColor={theme.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Send Reset Link button */}
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.resetButtonText}>
                      Send Reset Link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          {/* ─── Back to Login Link ────────────────────── */}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={handleGoBack}
          >
            <Icon
              name="arrow-back-circle-outline"
              size={18}
              color="#833AB4"
              style={styles.loginLinkIcon}
            />
            <Text style={styles.loginLinkText}>Back to Login</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Back button
  backButton: {
    marginTop: (StatusBar.currentHeight || 44) + 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header text
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  errorText: {
    color: '#FD1D1D',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Reset button
  resetButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#833AB4',
    shadowColor: '#833AB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Back to login link
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  loginLinkIcon: {
    marginRight: 6,
  },
  loginLinkText: {
    color: '#833AB4',
    fontSize: 14,
    fontWeight: '600',
  },

  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIconCircle: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#833AB4',
  },
  backToLoginButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#833AB4',
    paddingHorizontal: 40,
    width: '100%',
    shadowColor: '#833AB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendButton: {
    marginTop: 20,
  },
  resendText: {
    fontSize: 13,
    textAlign: 'center',
  },
  resendLink: {
    color: '#833AB4',
    fontWeight: '700',
  },
});

export default React.memo(ForgotPasswordScreen);
