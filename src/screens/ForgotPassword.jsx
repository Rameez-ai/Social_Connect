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
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { forgotPasswordValidationSchema } from '../utils/validation';
import { setLoading, setError } from '../redux/slices/authSlice';
import { authService } from '../services/authService';

const ForgotPassword = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  const [submitted, setSubmitted] = React.useState(false);

  const handleReset = async (values) => {
    try {
      dispatch(setLoading(true));
      await authService.resetPassword(values.email);
      setSubmitted(true);
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to send reset email'));
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.message}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </Text>
          <CustomButton
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.message}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordValidationSchema}
            onSubmit={handleReset}
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

                <CustomButton
                  title="Reset Password"
                  onPress={handleSubmit}
                  loading={isLoading}
                  style={styles.button}
                />
              </View>
            )}
          </Formik>

          {/* Back to Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backToLogin}>← Back to login</Text>
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
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  form: {
    width: '100%',
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
  button: {
    width: '100%',
  },
  backToLogin: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
});

export default ForgotPassword;
