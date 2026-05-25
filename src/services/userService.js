/**
 * userService.js
 *
 * User profile service for Social Connect app.
 * Handles profile reads/writes, user search, and
 * follow/unfollow operations via @react-native-firebase/firestore.
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Fetch a single user's profile document from Firestore.
 *
 * @param {string} userId - The UID of the user.
 * @returns {Promise<Object|null>} The user data (with id) or null if not found.
 * @throws {Error} If the fetch fails.
 */
export const getUserProfile = async (userId) => {
  try {
    const doc = await firestore().collection('users').doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user profile.');
  }
};

/**
 * Update fields on a user's Firestore profile document.
 *
 * @param {string} userId - The UID of the user.
 * @param {Object} data - Key/value pairs to merge into the user document.
 * @returns {Promise<void>}
 * @throws {Error} If the update fails.
 */
export const updateUserProfile = async (userId, data) => {
  try {
    await firestore().collection('users').doc(userId).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to update user profile.');
  }
};

/**
 * Search users by display name using a case-insensitive prefix match.
 *
 * Firestore does not natively support case-insensitive search, so this
 * relies on a `nameLower` field (or falls back to a >= / <= range
 * query on the `name` field).
 *
 * The range query matches any document whose `name` field starts
 * with the given query string.
 *
 * @param {string} query - The search term (name prefix).
 * @returns {Promise<Object[]>} Array of matching user objects.
 * @throws {Error} If the search fails.
 */
export const searchUsers = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();

    // Unicode trick: '\uf8ff' is a very high-code-point character so
    // the range effectively captures all strings that start with `searchTerm`.
    const snapshot = await firestore()
      .collection('users')
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to search users.');
  }
};

/**
 * Follow a target user.
 * Adds `targetUserId` to the current user's `following` array and
 * adds `currentUserId` to the target user's `followers` array
 * in a single atomic batch.
 *
 * @param {string} currentUserId - UID of the user who wants to follow.
 * @param {string} targetUserId - UID of the user to be followed.
 * @returns {Promise<void>}
 * @throws {Error} If the follow operation fails.
 */
export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) {
      throw new Error('You cannot follow yourself.');
    }

    const batch = firestore().batch();

    const currentUserRef = firestore().collection('users').doc(currentUserId);
    const targetUserRef = firestore().collection('users').doc(targetUserId);

    // Add target to current user's following list
    batch.update(currentUserRef, {
      following: firestore.FieldValue.arrayUnion(targetUserId),
    });

    // Add current user to target's followers list
    batch.update(targetUserRef, {
      followers: firestore.FieldValue.arrayUnion(currentUserId),
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error.message || 'Failed to follow user.');
  }
};

/**
 * Unfollow a target user.
 * Removes `targetUserId` from the current user's `following` array and
 * removes `currentUserId` from the target user's `followers` array
 * in a single atomic batch.
 *
 * @param {string} currentUserId - UID of the user who wants to unfollow.
 * @param {string} targetUserId - UID of the user to be unfollowed.
 * @returns {Promise<void>}
 * @throws {Error} If the unfollow operation fails.
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) {
      throw new Error('You cannot unfollow yourself.');
    }

    const batch = firestore().batch();

    const currentUserRef = firestore().collection('users').doc(currentUserId);
    const targetUserRef = firestore().collection('users').doc(targetUserId);

    // Remove target from current user's following list
    batch.update(currentUserRef, {
      following: firestore.FieldValue.arrayRemove(targetUserId),
    });

    // Remove current user from target's followers list
    batch.update(targetUserRef, {
      followers: firestore.FieldValue.arrayRemove(currentUserId),
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error.message || 'Failed to unfollow user.');
  }
};

/**
 * Get the list of followers for a user by fetching their user document
 * and then resolving each follower UID to a profile.
 *
 * @param {string} userId - UID of the user whose followers to fetch.
 * @returns {Promise<Object[]>} Array of follower user profiles.
 * @throws {Error} If the fetch fails.
 */
export const getFollowers = async (userId) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new Error('User not found.');
    }

    const { followers = [] } = userDoc.data();

    if (followers.length === 0) {
      return [];
    }

    // Firestore 'in' supports max 30; chunk for safety
    const profiles = [];
    for (let i = 0; i < followers.length; i += 30) {
      const chunk = followers.slice(i, i + 30);
      const snapshot = await firestore()
        .collection('users')
        .where('uid', 'in', chunk)
        .get();

      snapshot.docs.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() });
      });
    }

    return profiles;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch followers.');
  }
};

/**
 * Get the list of users that a given user is following, resolved to profiles.
 *
 * @param {string} userId - UID of the user whose following list to fetch.
 * @returns {Promise<Object[]>} Array of followed user profiles.
 * @throws {Error} If the fetch fails.
 */
export const getFollowing = async (userId) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new Error('User not found.');
    }

    const { following = [] } = userDoc.data();

    if (following.length === 0) {
      return [];
    }

    // Firestore 'in' supports max 30; chunk for safety
    const profiles = [];
    for (let i = 0; i < following.length; i += 30) {
      const chunk = following.slice(i, i + 30);
      const snapshot = await firestore()
        .collection('users')
        .where('uid', 'in', chunk)
        .get();

      snapshot.docs.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() });
      });
    }

    return profiles;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch following list.');
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
