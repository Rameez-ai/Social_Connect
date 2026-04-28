import * as Yup from 'yup';

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const signupValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

export const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

export const editProfileValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  bio: Yup.string()
    .max(200, 'Bio must be 200 characters or less'),
});

export const createPostValidationSchema = Yup.object().shape({
  text: Yup.string()
    .required('Post text is required')
    .min(1, 'Post cannot be empty')
    .max(500, 'Post text must be less than 500 characters'),
});
