/**
 * useNotifications.js
 * ------------------
 * Custom React hook that manages in-app and push notifications.
 * Requests user permissions, registers device token with FCM, and listens for
 * incoming foreground push notification payloads.
 *
 * Automatically syncs in-app lists and badge count via Redux notifications slice.
 *
 * @module hooks/useNotifications
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import notificationService from '../services/notificationService';
import {
  addNotification,
  setupPushNotifications,
  fetchNotifications,
} from '../store/slices/notificationsSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, fcmToken } = useSelector((state) => state.notifications);

  // 1. Initialise FCM Token and retrieve in-app list on mount / login
  useEffect(() => {
    if (!user) return;

    // Fetch initial list of in-app notifications
    dispatch(fetchNotifications(user.uid));

    // Register push notification permissions & FCM token
    dispatch(setupPushNotifications(user.uid));
  }, [user, dispatch]);

  // 2. Register listener for foreground FCM push alerts
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.onNotificationReceived(async (remoteMessage) => {
      console.log('[useNotifications] Foreground FCM message received:', remoteMessage);

      // Extract details from remoteMessage payload
      const { notification, data } = remoteMessage;

      // Construct a valid local notification record
      const newNotification = {
        id: remoteMessage.messageId || Math.random().toString(),
        recipientId: user.uid,
        senderId: data?.senderId || '',
        senderName: notification?.title || 'Social Connect',
        type: data?.type || 'info', // e.g., 'like', 'comment', 'message'
        postId: data?.postId || null,
        read: false,
        createdAt: new Date().toISOString(),
      };

      // Add to Redux store in real-time
      dispatch(addNotification(newNotification));
    });

    return () => unsubscribe(); // clean up subscriber on unmount
  }, [user, dispatch]);

  return {
    notifications,
    unreadCount,
    fcmToken,
  };
};

export default useNotifications;
