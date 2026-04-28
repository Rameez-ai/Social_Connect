import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomButton,
  CustomInput,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { loginValidationSchema } from '../utils/validation';
import { setLoading, setUser, setError } from '../redux/slices/authSlice';
import { authService } from '../services/authService';

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const handleLogin = async (values) => {
    try {
      dispatch(setLoading(true));
      const user = await authService.login(values.email, values.password);
      dispatch(setUser(user));
    } catch (err) {
      dispatch(setError(err.message || 'Login failed'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🔗</Text>
          <Text style={styles.appName}>Social Connect</Text>
          <Text style={styles.tagline}>Reconnecting the world through conversation</Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginValidationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <CustomInput
                label="Email Address"
                placeholder="name@example.com"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                leftIcon={<Text>@</Text>}
              />

              <CustomInput
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                error={touched.password && errors.password}
                leftIcon={<Text>🔒</Text>}
              />

              <CustomButton
                title="Sign In"
                onPress={handleSubmit}
                loading={isLoading}
                style={styles.signInButton}
              />
            </View>
          )}
        </Formik>

        {/* Forgot Password Link */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Social Login */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>🔍</Text>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Create a new account</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: colors.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  signInButton: {
    marginTop: SPACING.lg,
  },
  forgotPassword: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: colors.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
  },
  socialIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  socialText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
});

export default Login;