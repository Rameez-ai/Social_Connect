import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomButton,
  CustomInput,
  Checkbox,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { signupValidationSchema } from '../utils/validation';
import { setLoading, setUser, setError } from '../redux/slices/authSlice';
import { authService } from '../services/authService';

const Signup = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const handleSignup = async (values) => {
    try {
      dispatch(setLoading(true));
      const user = await authService.signUp(
        values.email,
        values.password,
        values.fullName
      );
      dispatch(setUser(user));
    } catch (err) {
      dispatch(setError(err.message || 'Signup failed'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in your details to get started today.</Text>

          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
              termsAccepted: false,
            }}
            validationSchema={signupValidationSchema}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.form}>
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <CustomInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName && errors.fullName}
                  leftIcon={<Text>👤</Text>}
                />

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
                  placeholder="Enter password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  error={touched.password && errors.password}
                  leftIcon={<Text>🔒</Text>}
                />

                <CustomInput
                  label="Confirm Password"
                  placeholder="Confirm password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry
                  error={touched.confirmPassword && errors.confirmPassword}
                  leftIcon={<Text>🔒</Text>}
                />

                <Checkbox
                  label="I agree to the Terms of Service and Privacy Policy."
                  checked={values.termsAccepted}
                  onChange={(checked) => setFieldValue('termsAccepted', checked)}
                />
                {touched.termsAccepted && errors.termsAccepted && (
                  <Text style={styles.checkboxError}>{errors.termsAccepted}</Text>
                )}

                <CustomButton
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={isLoading}
                  style={styles.signupButton}
                />
              </View>
            )}
          </Formik>

          {/* Already have account */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in here</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    fontSize: FONT_SIZES.xl,
    color: colors.text,
    fontWeight: '600',
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    marginBottom: SPACING.lg,
  },
  form: {
    marginTop: SPACING.lg,
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
  checkboxError: {
    color: colors.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  signupButton: {
    marginTop: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
});

export default Signup;