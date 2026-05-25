/**
 * notificationService.js
 *
 * Notification & push-messaging service for Social Connect app.
 * Handles in-app notifications stored in Firestore as well as
 * FCM token management and push notification listeners via
 * @react-native-firebase/firestore and @react-native-firebase/messaging.
 */

import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

/**
 * Create a new in-app notification document in the "notifications" collection.
 *
 * @param {string} recipientId - UID of the notification recipient.
 * @param {string} senderId - UID of the user who triggered the notification.
 * @param {string} senderName - Display name of the sender.
 * @param {string} type - Notification type: 'like', 'comment', 'follow', 'message', etc.
 * @param {string|null} [postId=null] - Related post ID (if applicable).
 * @returns {Promise<import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentReference>}
 *   The DocumentReference of the created notification.
 * @throws {Error} If creating the notification fails.
 */
export const createNotification = async (recipientId, senderId, senderName, type, postId = null) => {
  try {
    // Avoid sending notifications to yourself
    if (recipientId === senderId) {
      return null;
    }

    const notificationRef = await firestore().collection('notifications').add({
      recipientId,
      senderId,
      senderName,
      type,
      postId,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return notificationRef;
  } catch (error) {
    throw new Error(error.message || 'Failed to create notification.');
  }
};

/**
 * Fetch all notifications for a given user, ordered newest-first.
 *
 * @param {string} userId - UID of the notification recipient.
 * @returns {Promise<Object[]>} Array of notification objects.
 * @throws {Error} If fetching notifications fails.
 */
export const getNotifications = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection('notifications')
      .where('recipientId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch notifications.');
  }
};

/**
 * Mark a single notification as read.
 *
 * @param {string} notificationId - The Firestore document ID of the notification.
 * @returns {Promise<void>}
 * @throws {Error} If the update fails.
 */
export const markAsRead = async (notificationId) => {
  try {
    await firestore().collection('notifications').doc(notificationId).update({
      read: true,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to mark notification as read.');
  }
};

/**
 * Request push-notification permission from the user (iOS required, Android auto-granted < 13).
 *
 * @returns {Promise<boolean>} `true` if permission was granted, `false` otherwise.
 * @throws {Error} If the permission request fails.
 */
export const requestPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    throw new Error(error.message || 'Failed to request notification permission.');
  }
};

/**
 * Retrieve the device's FCM registration token.
 *
 * @returns {Promise<string>} The FCM token string.
 * @throws {Error} If token retrieval fails.
 */
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    throw new Error(error.message || 'Failed to get FCM token.');
  }
};

/**
 * Save the FCM token to the user's Firestore document so
 * the backend can target push notifications to this device.
 *
 * @param {string} userId - UID of the current user.
 * @param {string} token - The FCM registration token.
 * @returns {Promise<void>}
 * @throws {Error} If saving the token fails.
 */
export const saveFCMToken = async (userId, token) => {
  try {
    await firestore().collection('users').doc(userId).update({
      fcmToken: token,
      platform: Platform.OS,
      tokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to save FCM token.');
  }
};

/**
 * Register a listener for foreground push notifications.
 * Called whenever a push message arrives while the app is in the foreground.
 *
 * @param {function(import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage): void} callback
 *   Called with the remote message payload.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const onNotificationReceived = (callback) => {
  return messaging().onMessage(callback);
};

/**
 * Register the background / quit-state message handler.
 * Must be called outside of any React component (e.g. in index.js).
 *
 * @param {function(import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage): Promise<void>} [handler]
 *   Optional custom handler; defaults to a no-op logger.
 */
export const setupBackgroundHandler = (handler) => {
  messaging().setBackgroundMessageHandler(
    handler ||
      (async (remoteMessage) => {
        // Default handler — log the incoming background message
        console.log('[notificationService] Background message received:', remoteMessage);
      }),
  );
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  requestPermission,
  getFCMToken,
  saveFCMToken,
  onNotificationReceived,
  setupBackgroundHandler,
};
