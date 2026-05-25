/**
 * SignUpScreen.js
 * 
 * Account creation screen with gradient hero, Formik validation,
 * themed styling (dark/light), and Redux auth integration.
 * Features:
 * - Gradient header with 'Create Account' branding
 * - Name, email, password, confirm password fields with icons
 * - Sign Up button with gradient styling
 * - Already have an account → Login navigation
 * - Loading state + error display via Toast
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
import { signUpSchema } from '../../utils/validators';
import { signUpUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const { width, height } = Dimensions.get('window');

const SignUpScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // ─── Local State ──────────────────────────────────────────
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Handlers ─────────────────────────────────────────────

  /**
   * Submit registration credentials via Redux thunk.
   * On success, the auth state listener in the navigator handles navigation.
   */
  const handleSignUp = useCallback(
    async (values) => {
      try {
        await dispatch(
          signUpUser({
            name: values.name,
            email: values.email,
            password: values.password,
          })
        ).unwrap();
        // Navigation handled automatically by auth listener
      } catch (err) {
        setToastMessage(err?.message || 'Sign up failed. Please try again.');
        setToastVisible(true);
      }
    },
    [dispatch]
  );

  /** Navigate back to the Login screen */
  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

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

      {/* Error toast */}
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
              <View style={[styles.gradientLayer, styles.gradientPurple]} />
              <View style={[styles.gradientLayer, styles.gradientRed]} />
              <View style={[styles.gradientLayer, styles.gradientOrange]} />

              <View style={styles.heroContent}>
                <Icon name="person-add-outline" size={50} color="#FFFFFF" />
                <Text style={styles.heroTitle}>Create Account</Text>
                <Text style={styles.heroTagline}>
                  Join the community today
                </Text>
              </View>
            </View>

            {/* Curved bottom edge */}
            <View
              style={[styles.heroCurve, { backgroundColor: theme.background }]}
            />
          </View>

          {/* ─── Sign Up Form ──────────────────────────────── */}
          <View style={styles.formContainer}>
            <Text style={[styles.titleText, { color: theme.text }]}>
              Get Started
            </Text>
            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
              Fill in your details to create an account
            </Text>

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={signUpSchema}
              onSubmit={handleSignUp}
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
                  {/* ── Full Name ────────────────────────── */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: theme.inputBackground,
                          borderColor:
                            touched.name && errors.name
                              ? '#FD1D1D'
                              : theme.border,
                        },
                      ]}
                    >
                      <Icon
                        name="person-outline"
                        size={20}
                        color={theme.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Full Name"
                        placeholderTextColor={theme.placeholder}
                        autoCapitalize="words"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                      />
                    </View>
                    {touched.name && errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>

                  {/* ── Email ────────────────────────────── */}
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

                  {/* ── Password ─────────────────────────── */}
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
                        secureTextEntry={securePassword}
                        autoCapitalize="none"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                      />
                      <TouchableOpacity
                        onPress={() => setSecurePassword((p) => !p)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Icon
                          name={
                            securePassword ? 'eye-off-outline' : 'eye-outline'
                          }
                          size={20}
                          color={theme.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  {/* ── Confirm Password ─────────────────── */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: theme.inputBackground,
                          borderColor:
                            touched.confirmPassword && errors.confirmPassword
                              ? '#FD1D1D'
                              : theme.border,
                        },
                      ]}
                    >
                      <Icon
                        name="shield-checkmark-outline"
                        size={20}
                        color={theme.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.placeholder}
                        secureTextEntry={secureConfirm}
                        autoCapitalize="none"
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                      />
                      <TouchableOpacity
                        onPress={() => setSecureConfirm((p) => !p)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Icon
                          name={
                            secureConfirm ? 'eye-off-outline' : 'eye-outline'
                          }
                          size={20}
                          color={theme.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  {/* ── Sign Up Button ────────────────────── */}
                  <TouchableOpacity
                    style={[
                      styles.signUpButton,
                      loading && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.signUpButtonText}>Sign Up</Text>
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

            {/* ─── Login Link ──────────────────────────── */}
            <View style={styles.loginContainer}>
              <Text
                style={[styles.loginText, { color: theme.textSecondary }]}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },

  // Hero / Gradient header
  heroContainer: {
    position: 'relative',
    height: height * 0.28,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 1,
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
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
    paddingTop: 8,
    paddingBottom: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },

  // Input fields
  inputWrapper: {
    marginBottom: 14,
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

  // Sign Up button
  signUpButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#833AB4',
    marginTop: 8,
    shadowColor: '#833AB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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

  // Login link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#833AB4',
  },
});

export default React.memo(SignUpScreen);
