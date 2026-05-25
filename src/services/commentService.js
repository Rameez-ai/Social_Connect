/**
 * commentService.js
 *
 * Comment service for Social Connect app.
 * Manages the posts/{postId}/comments subcollection —
 * adding, fetching, deleting comments, and real-time
 * subscriptions via @react-native-firebase/firestore.
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Add a new comment to a post's comments subcollection
 * and atomically increment the parent post's commentCount.
 *
 * @param {string} postId - The Firestore document ID of the parent post.
 * @param {string} userId - UID of the comment author.
 * @param {string} userName - Display name of the comment author.
 * @param {string} userAvatar - Avatar URL of the comment author.
 * @param {string} text - The comment body text.
 * @returns {Promise<import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentReference>}
 *   The DocumentReference of the newly created comment.
 * @throws {Error} If adding the comment fails.
 */
export const addComment = async (postId, userId, userName, userAvatar, text) => {
  try {
    const postRef = firestore().collection('posts').doc(postId);

    // Verify the parent post exists before adding a comment
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      throw new Error('The post you are commenting on no longer exists.');
    }

    // Add the comment to the subcollection
    const commentRef = await postRef.collection('comments').add({
      userId,
      userName,
      userAvatar,
      text,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Increment the parent post's comment counter
    await postRef.update({
      commentCount: firestore.FieldValue.increment(1),
    });

    return commentRef;
  } catch (error) {
    throw new Error(error.message || 'Failed to add comment.');
  }
};

/**
 * Fetch all comments for a given post, ordered oldest-first.
 *
 * @param {string} postId - The Firestore document ID of the parent post.
 * @returns {Promise<Object[]>} Array of comment objects (each includes its doc id).
 * @throws {Error} If fetching comments fails.
 */
export const getComments = async (postId) => {
  try {
    const snapshot = await firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch comments.');
  }
};

/**
 * Delete a single comment from a post's subcollection
 * and atomically decrement the parent post's commentCount.
 *
 * @param {string} postId - The Firestore document ID of the parent post.
 * @param {string} commentId - The Firestore document ID of the comment.
 * @returns {Promise<void>}
 * @throws {Error} If the deletion fails.
 */
export const deleteComment = async (postId, commentId) => {
  try {
    const postRef = firestore().collection('posts').doc(postId);
    const commentRef = postRef.collection('comments').doc(commentId);

    // Verify the comment exists
    const commentDoc = await commentRef.get();
    if (!commentDoc.exists) {
      throw new Error('Comment not found.');
    }

    // Use a batch to delete the comment and decrement the counter atomically
    const batch = firestore().batch();
    batch.delete(commentRef);
    batch.update(postRef, {
      commentCount: firestore.FieldValue.increment(-1),
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error.message || 'Failed to delete comment.');
  }
};

/**
 * Subscribe to real-time updates on a post's comments subcollection.
 * The callback is invoked every time the comments change (add / delete).
 *
 * @param {string} postId - The Firestore document ID of the parent post.
 * @param {function(Object[]): void} callback - Called with the updated comments array.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const subscribeToComments = (postId, callback) => {
  const unsubscribe = firestore()
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(comments);
      },
      (error) => {
        console.error('[commentService] subscribeToComments error:', error);
        callback([]);
      },
    );

  return unsubscribe;
};

export default {
  addComment,
  getComments,
  deleteComment,
  subscribeToComments,
};
