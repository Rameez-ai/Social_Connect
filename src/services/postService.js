/**
 * postService.js
 *
 * Post CRUD service for Social Connect app.
 * Handles creating, reading, updating, deleting posts,
 * toggling likes, pagination, and real-time feed subscriptions
 * via @react-native-firebase/firestore.
 */

import firestore from '@react-native-firebase/firestore';

/** Number of posts to fetch per page */
const PAGE_SIZE = 10;

/**
 * Create a new post in the "posts" Firestore collection
 * and increment the author's postCount.
 *
 * @param {string} userId - UID of the post author.
 * @param {string} text - Post caption / body text.
 * @param {string} imageUrl - URL of the uploaded post image (can be empty).
 * @param {string} userName - Display name of the author.
 * @param {string} userAvatar - Avatar URL of the author.
 * @returns {Promise<import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentReference>}
 *   The DocumentReference of the newly created post.
 * @throws {Error} If post creation fails.
 */
export const createPost = async (userId, text, imageUrl, userName, userAvatar) => {
  try {
    const postRef = await firestore().collection('posts').add({
      userId,
      text,
      imageUrl: imageUrl || '',
      userName,
      userAvatar,
      likes: [],
      likeCount: 0,
      commentCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Increment the author's post counter
    await firestore().collection('users').doc(userId).update({
      postCount: firestore.FieldValue.increment(1),
    });

    return postRef;
  } catch (error) {
    throw new Error(error.message || 'Failed to create post.');
  }
};

/**
 * Fetch a paginated feed of posts from followed users.
 * Posts are ordered by createdAt descending with cursor-based pagination.
 *
 * @param {string[]} following - Array of user IDs the current user follows.
 * @param {import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentSnapshot|null} [lastDoc=null]
 *   The last document snapshot from the previous page (for pagination).
 * @returns {Promise<{posts: Object[], lastVisible: import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentSnapshot|null}>}
 *   An object with the posts array and the last visible document snapshot.
 * @throws {Error} If fetching posts fails.
 */
export const getPosts = async (following, lastDoc = null) => {
  try {
    // Firestore "in" queries support max 30 items; fall back to all posts when
    // the following list is empty or exceeds that limit.
    if (!following || following.length === 0) {
      return { posts: [], lastVisible: null };
    }

    // Firestore 'in' operator supports a max of 30 values per query.
    // Chunk the following list into batches of 30 and merge results.
    const chunks = [];
    for (let i = 0; i < following.length; i += 30) {
      chunks.push(following.slice(i, i + 30));
    }

    let allPosts = [];
    let newLastVisible = null;

    for (const chunk of chunks) {
      let query = firestore()
        .collection('posts')
        .where('userId', 'in', chunk)
        .orderBy('createdAt', 'desc')
        .limit(PAGE_SIZE);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      allPosts = [...allPosts, ...posts];

      // Keep track of the very last document for pagination
      if (snapshot.docs.length > 0) {
        newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      }
    }

    // Sort merged results by createdAt descending and cap at PAGE_SIZE
    allPosts.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });

    allPosts = allPosts.slice(0, PAGE_SIZE);

    return { posts: allPosts, lastVisible: newLastVisible };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch posts.');
  }
};

/**
 * Fetch a single post by its document ID.
 *
 * @param {string} postId - The Firestore document ID of the post.
 * @returns {Promise<Object|null>} The post data with its id, or null if not found.
 * @throws {Error} If the fetch fails.
 */
export const getPostById = async (postId) => {
  try {
    const doc = await firestore().collection('posts').doc(postId).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch post.');
  }
};

/**
 * Fetch all posts authored by a specific user, ordered by newest first.
 *
 * @param {string} userId - The UID of the post author.
 * @returns {Promise<Object[]>} Array of post objects.
 * @throws {Error} If the fetch fails.
 */
export const getUserPosts = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user posts.');
  }
};

/**
 * Update the text (caption) of an existing post.
 *
 * @param {string} postId - The Firestore document ID of the post.
 * @param {string} text - The new post text / caption.
 * @returns {Promise<void>}
 * @throws {Error} If the update fails.
 */
export const updatePost = async (postId, text) => {
  try {
    await firestore().collection('posts').doc(postId).update({
      text,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to update post.');
  }
};

/**
 * Delete a post and all of its comments (subcollection).
 * Also decrements the author's postCount.
 *
 * @param {string} postId - The Firestore document ID of the post.
 * @returns {Promise<void>}
 * @throws {Error} If the deletion fails.
 */
export const deletePost = async (postId) => {
  try {
    const postRef = firestore().collection('posts').doc(postId);

    // Read the post first so we know the author
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      throw new Error('Post not found.');
    }

    const postData = postDoc.data();

    // Delete all comments in the subcollection (Firestore doesn't cascade)
    const commentsSnapshot = await postRef.collection('comments').get();
    const batch = firestore().batch();

    commentsSnapshot.docs.forEach((commentDoc) => {
      batch.delete(commentDoc.ref);
    });

    // Delete the post itself
    batch.delete(postRef);

    // Decrement the author's postCount
    batch.update(firestore().collection('users').doc(postData.userId), {
      postCount: firestore.FieldValue.increment(-1),
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error.message || 'Failed to delete post.');
  }
};

/**
 * Toggle a like on a post. If the user has already liked it, the
 * like is removed; otherwise it is added. Uses atomic arrayUnion /
 * arrayRemove and increments / decrements the likeCount.
 *
 * @param {string} postId - The Firestore document ID of the post.
 * @param {string} userId - The UID of the user toggling the like.
 * @returns {Promise<boolean>} `true` if the post is now liked, `false` if unliked.
 * @throws {Error} If the operation fails.
 */
export const toggleLike = async (postId, userId) => {
  try {
    const postRef = firestore().collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error('Post not found.');
    }

    const postData = postDoc.data();
    const isLiked = postData.likes && postData.likes.includes(userId);

    if (isLiked) {
      // Unlike – remove the userId and decrement counter
      await postRef.update({
        likes: firestore.FieldValue.arrayRemove(userId),
        likeCount: firestore.FieldValue.increment(-1),
      });
      return false;
    } else {
      // Like – add the userId and increment counter
      await postRef.update({
        likes: firestore.FieldValue.arrayUnion(userId),
        likeCount: firestore.FieldValue.increment(1),
      });
      return true;
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to toggle like.');
  }
};

/**
 * Subscribe to a real-time feed of posts from followed users.
 * Calls the provided callback every time the result set changes.
 *
 * @param {string[]} following - Array of user IDs the current user follows.
 * @param {function(Object[]): void} callback - Called with the updated posts array.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const subscribeToFeed = (following, callback) => {
  if (!following || following.length === 0) {
    // No users to follow — immediately return empty and a no-op unsubscribe
    callback([]);
    return () => {};
  }

  // Use the first 30 followed user IDs (Firestore 'in' limit)
  const limitedFollowing = following.slice(0, 30);

  const unsubscribe = firestore()
    .collection('posts')
    .where('userId', 'in', limitedFollowing)
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE)
    .onSnapshot(
      (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(posts);
      },
      (error) => {
        console.error('[postService] subscribeToFeed error:', error);
        callback([]);
      },
    );

  return unsubscribe;
};

export default {
  createPost,
  getPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  subscribeToFeed,
};
