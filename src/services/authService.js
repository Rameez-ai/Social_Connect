/**
 * authService.js
 * 
 * Authentication service for Social Connect app.
 * Handles user sign-up, login, logout, password reset,
 * profile updates, and auth state observation using
 * @react-native-firebase/auth and @react-native-firebase/firestore.
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Log in an existing user with email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<import('@react-native-firebase/auth').FirebaseAuthTypes.UserCredential>}
 *   The Firebase UserCredential on success.
 * @throws {Error} If sign-in fails (invalid credentials, network error, etc.).
 */
export const login = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);

    // Update the lastLogin timestamp in the user's Firestore document
    await firestore().collection('users').doc(userCredential.user.uid).update({
      lastLogin: firestore.FieldValue.serverTimestamp(),
    });

    return userCredential;
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('The email address is not valid.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled. Please contact support.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed login attempts. Please try again later.');
      default:
        throw new Error(error.message || 'An unexpected error occurred during login.');
    }
  }
};

/**
 * Register a new user with email, password, and display name.
 * Creates a Firebase Auth account and a corresponding Firestore
 * user document in the "users" collection.
 *
 * @param {string} email - The new user's email address.
 * @param {string} password - The new user's password (min 6 chars).
 * @param {string} name - The user's display name.
 * @returns {Promise<import('@react-native-firebase/auth').FirebaseAuthTypes.UserCredential>}
 *   The Firebase UserCredential on success.
 * @throws {Error} If registration fails.
 */
export const signUp = async (email, password, name) => {
  try {
    // Create the Firebase Auth account
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const { uid } = userCredential.user;

    // Set display name on the Auth profile
    await userCredential.user.updateProfile({ displayName: name });

    // Create the Firestore user document with default fields
    await firestore().collection('users').doc(uid).set({
      uid,
      email,
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      bio: '',
      avatar: '',
      website: '',
      followers: [],
      following: [],
      postCount: 0,
      fcmToken: '',
      isVerified: false,
      isPrivate: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastLogin: firestore.FieldValue.serverTimestamp(),
    });

    return userCredential;
  } catch (error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('An account with this email already exists.');
      case 'auth/invalid-email':
        throw new Error('The email address is not valid.');
      case 'auth/weak-password':
        throw new Error('Password is too weak. Use at least 6 characters.');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password sign-up is not enabled.');
      default:
        throw new Error(error.message || 'An unexpected error occurred during sign-up.');
    }
  }
};

/**
 * Sign the current user out.
 *
 * @returns {Promise<void>}
 * @throws {Error} If sign-out fails.
 */
export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw new Error(error.message || 'An unexpected error occurred during logout.');
  }
};

/**
 * Send a password-reset email to the given address.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 * @throws {Error} If the reset email cannot be sent.
 */
export const resetPassword = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/invalid-email':
        throw new Error('The email address is not valid.');
      default:
        throw new Error(error.message || 'Failed to send password reset email.');
    }
  }
};

/**
 * Update the authenticated user's profile in both Firebase Auth
 * and the Firestore "users" document.
 *
 * @param {string} userId - The UID of the user to update.
 * @param {Object} data - Key/value pairs to merge into the user doc.
 * @param {string} [data.name] - New display name.
 * @param {string} [data.avatar] - New avatar URL.
 * @param {string} [data.bio] - New bio text.
 * @param {string} [data.website] - New website URL.
 * @param {string} [data.username] - New username.
 * @returns {Promise<void>}
 * @throws {Error} If the update fails.
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const currentUser = auth().currentUser;

    // If the Auth profile fields changed, update Firebase Auth too
    if (currentUser && currentUser.uid === userId) {
      const authUpdate = {};
      if (data.name) authUpdate.displayName = data.name;
      if (data.avatar) authUpdate.photoURL = data.avatar;

      if (Object.keys(authUpdate).length > 0) {
        await currentUser.updateProfile(authUpdate);
      }
    }

    // Merge updated fields + updatedAt into Firestore
    await firestore().collection('users').doc(userId).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to update user profile.');
  }
};

/**
 * Return the currently authenticated Firebase Auth user, or null.
 *
 * @returns {import('@react-native-firebase/auth').FirebaseAuthTypes.User | null}
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Subscribe to authentication state changes.
 *
 * @param {function} callback - Called with the Firebase User (or null) on every state change.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

export default {
  login,
  signUp,
  logout,
  resetPassword,
  updateUserProfile,
  getCurrentUser,
  onAuthStateChanged,
};
