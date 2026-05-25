/**
 * storageService.js
 *
 * Firebase Storage service for Social Connect app.
 * Handles image uploading (profile & post images), deletion,
 * and client-side compression via @react-native-firebase/storage
 * and @bam.tech/react-native-image-resizer.
 */

import storage from '@react-native-firebase/storage';
import { ReactNativeImageResizer } from '@bam.tech/react-native-image-resizer';

/**
 * Compress / resize an image before uploading.
 * Reduces the image to a max of 1080×1080 at 80 % JPEG quality,
 * keeping the aspect ratio intact.
 *
 * @param {string} uri - Local file URI of the original image.
 * @param {number} [maxWidth=1080] - Maximum width in pixels.
 * @param {number} [maxHeight=1080] - Maximum height in pixels.
 * @param {number} [quality=80] - JPEG compression quality (0–100).
 * @returns {Promise<string>} The local file URI of the compressed image.
 * @throws {Error} If compression fails.
 */
export const compressImage = async (uri, maxWidth = 1080, maxHeight = 1080, quality = 80) => {
  try {
    const result = await ReactNativeImageResizer.createResizedImage(
      uri,
      maxWidth,
      maxHeight,
      'JPEG',
      quality,
      0, // rotation
    );

    return result.uri;
  } catch (error) {
    throw new Error(error.message || 'Failed to compress image.');
  }
};

/**
 * Upload an image file to Firebase Storage at the given path
 * and return the publicly accessible download URL.
 *
 * The local file URI is normalised for both Android and iOS
 * (strips the `file://` prefix on Android if present).
 *
 * @param {string} uri - Local file URI of the image to upload.
 * @param {string} storagePath - Destination path in Firebase Storage (e.g. "postImages/abc123").
 * @returns {Promise<string>} The download URL of the uploaded file.
 * @throws {Error} If the upload fails.
 */
export const uploadImage = async (uri, storagePath) => {
  try {
    const reference = storage().ref(storagePath);

    // Normalise the URI — React Native image pickers may return
    // "file:///…" on Android which putFile handles, but we keep
    // it consistent.
    const filePath = uri.startsWith('file://') ? uri : `file://${uri}`;

    // Upload the file
    await reference.putFile(filePath);

    // Retrieve and return the download URL
    const downloadUrl = await reference.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    throw new Error(error.message || 'Failed to upload image.');
  }
};

/**
 * Upload a user's profile image.
 * Compresses the image first, then stores it at "profileImages/{userId}".
 *
 * @param {string} userId - UID of the user.
 * @param {string} uri - Local file URI of the selected image.
 * @returns {Promise<string>} The download URL of the uploaded profile image.
 * @throws {Error} If compression or upload fails.
 */
export const uploadProfileImage = async (userId, uri) => {
  try {
    // Compress to a smaller size suitable for avatars
    const compressedUri = await compressImage(uri, 500, 500, 85);

    const storagePath = `profileImages/${userId}`;
    const downloadUrl = await uploadImage(compressedUri, storagePath);

    return downloadUrl;
  } catch (error) {
    throw new Error(error.message || 'Failed to upload profile image.');
  }
};

/**
 * Upload a post image.
 * Compresses the image first, then stores it at "postImages/{postId}".
 *
 * @param {string} postId - Firestore document ID of the post.
 * @param {string} uri - Local file URI of the selected image.
 * @returns {Promise<string>} The download URL of the uploaded post image.
 * @throws {Error} If compression or upload fails.
 */
export const uploadPostImage = async (postId, uri) => {
  try {
    // Compress to feed-quality dimensions
    const compressedUri = await compressImage(uri, 1080, 1080, 80);

    const storagePath = `postImages/${postId}`;
    const downloadUrl = await uploadImage(compressedUri, storagePath);

    return downloadUrl;
  } catch (error) {
    throw new Error(error.message || 'Failed to upload post image.');
  }
};

/**
 * Delete a file from Firebase Storage by its storage path.
 *
 * @param {string} storagePath - The path of the file in Firebase Storage.
 * @returns {Promise<void>}
 * @throws {Error} If the deletion fails.
 */
export const deleteImage = async (storagePath) => {
  try {
    const reference = storage().ref(storagePath);
    await reference.delete();
  } catch (error) {
    // Ignore "object-not-found" — the image may have already been deleted
    if (error.code === 'storage/object-not-found') {
      console.warn('[storageService] Image already deleted or not found:', storagePath);
      return;
    }
    throw new Error(error.message || 'Failed to delete image.');
  }
};

export default {
  uploadImage,
  uploadProfileImage,
  uploadPostImage,
  deleteImage,
  compressImage,
};
