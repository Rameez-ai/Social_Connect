/**
 * LoginScreen.js
 * 
 * Beautiful login screen with gradient hero section, Formik validation,
 * themed styling (dark/light), and Redux auth integration.
 * Features:
 * - Gradient header with app branding
 * - Email + password fields with icons
 * - Login button with gradient styling
 * - Forgot password & sign up navigation links
 * - Loading state + error display
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../utils/theme';
import { loginSchema } from '../../utils/validators';
import { loginUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // ─── Local State ──────────────────────────────────────────
  const [secureEntry, setSecureEntry] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Handlers ─────────────────────────────────────────────

  /**
   * Submit login credentials via Redux thunk.
   * Shows toast on error.
   */
  const handleLogin = useCallback(
    async (values) => {
      try {
        const result = await dispatch(
          loginUser({ email: values.email, password: values.password })
        ).unwrap();
        // Navigation is handled by auth state listener in the navigator
      } catch (err) {
        setToastMessage(err?.message || 'Login failed. Please try again.');
        setToastVisible(true);
      }
    },
    [dispatch]
  );

  /** Navigate to the Forgot Password screen */
  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  /** Navigate to the Sign Up screen */
  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  /** Toggle password visibility */
  const toggleSecureEntry = useCallback(() => {
    setSecureEntry((prev) => !prev);
  }, []);

  // ─── Dynamic Styles ───────────────────────────────────────
  const dynamicStyles = getDynamicStyles(theme);

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Loading overlay */}
      {loading && <LoadingSpinner overlay />}

      {/* Toast for error messages */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
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
          {/* ─── Gradient Hero Section ─────────────────────── */}
          <View style={styles.heroContainer}>
            <View style={styles.gradientHero}>
              {/* Gradient layers to simulate multi-stop gradient */}
              <View style={[styles.gradientLayer, styles.gradientPurple]} />
              <View style={[styles.gradientLayer, styles.gradientRed]} />
              <View style={[styles.gradientLayer, styles.gradientOrange]} />

              {/* Branding overlay */}
              <View style={styles.heroContent}>
                <Icon name="people-circle-outline" size={60} color="#FFFFFF" />
                <Text style={styles.heroTitle}>Social Connect</Text>
                <Text style={styles.heroTagline}>
                  Share moments. Build connections.
                </Text>
              </View>
            </View>

            {/* Curved bottom edge */}
            <View
              style={[
                styles.heroCurve,
                { backgroundColor: theme.background },
              ]}
            />
          </View>

          {/* ─── Login Form ────────────────────────────────── */}
          <View style={styles.formContainer}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
              Sign in to continue
            </Text>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  {/* ── Email Input ──────────────────────── */}
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

                  {/* ── Password Input ───────────────────── */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: theme.inputBackground,
                          borderColor:
                            touched.password && errors.password
                              ? '#FD1D1D'
                              : theme.border,
                        },
                      ]}
                    >
                      <Icon
                        name="lock-closed-outline"
                        size={20}
                        color={theme.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Password"
                        placeholderTextColor={theme.placeholder}
                        secureTextEntry={secureEntry}
                        autoCapitalize="none"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                      />
                      <TouchableOpacity
                        onPress={toggleSecureEntry}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Icon
                          name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={theme.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  {/* ── Forgot Password Link ─────────────── */}
                  <TouchableOpacity
                    style={styles.forgotPasswordBtn}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* ── Login Button ──────────────────────── */}
                  <TouchableOpacity
                    style={[styles.loginButton, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            {/* ─── Divider ─────────────────────────────── */}
            <View style={styles.dividerContainer}>
              <View
                style={[styles.dividerLine, { backgroundColor: theme.border }]}
              />
              <Text
                style={[styles.dividerText, { color: theme.textSecondary }]}
              >
                OR
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: theme.border }]}
              />
            </View>

            {/* ─── Sign Up Link ────────────────────────── */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Helper: dynamic styles based on theme ──────────────────
const getDynamicStyles = (theme) => ({
  inputBg: theme.inputBackground,
  borderColor: theme.border,
});

// ─── Static Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero / Gradient header
  heroContainer: {
    position: 'relative',
    height: height * 0.35,
    overflow: 'hidden',
  },
  gradientHero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientPurple: {
    backgroundColor: '#833AB4',
    opacity: 0.9,
  },
  gradientRed: {
    backgroundColor: '#FD1D1D',
    opacity: 0.3,
  },
  gradientOrange: {
    backgroundColor: '#F77737',
    opacity: 0.15,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: 1,
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  heroCurve: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    right: -10,
    height: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  // Form section
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },

  // Input fields
  inputWrapper: {
    marginBottom: 16,
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

  // Forgot password
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#833AB4',
    fontSize: 13,
    fontWeight: '600',
  },

  // Login button
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },

  // Sign up link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#833AB4',
  },
});

export default React.memo(LoginScreen);
