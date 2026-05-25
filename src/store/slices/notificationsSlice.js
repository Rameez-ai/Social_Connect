/**
 * Notifications Slice
 *
 * Manages in-app notifications, unread badge count, and the
 * Firebase Cloud Messaging (FCM) device token for push notifications.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /** Array of notification objects sorted by createdAt desc */
  notifications: [],
  /** Count of unread notifications (used for badge display) */
  unreadCount: 0,
  /** The FCM device token stored for this device */
  fcmToken: null,
  /** Loading flag */
  loading: false,
  /** Last error message */
  error: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * fetchNotifications — load notifications for the current user.
 * @param {string} userId
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getNotifications(userId);
      // Compute unread count from the fetched list
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch notifications.',
      );
    }
  },
);

/**
 * markNotificationRead — mark a single notification as read.
 * @param {Object} params - { notificationId, userId }
 */
export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async ({ notificationId, userId }, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to mark notification as read.',
      );
    }
  },
);

/**
 * markAllNotificationsRead — mark every notification for a user as read.
 * @param {string} userId
 */
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (userId, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead(userId);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to mark all notifications as read.',
      );
    }
  },
);

/**
 * setupPushNotifications — request permission, retrieve the FCM token,
 * and persist it to Firestore so the backend can target this device.
 * @param {string} userId
 */
export const setupPushNotifications = createAsyncThunk(
  'notifications/setupPushNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await notificationService.requestPermission();
      if (token) {
        await notificationService.saveFCMToken(userId, token);
      }
      return token;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to set up push notifications.',
      );
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /** setNotifications — replace the full notifications array. */
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },

    /**
     * addNotification — prepend a new notification (e.g., from a
     * foreground FCM message received in the useNotifications hook).
     */
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },

    /** setUnreadCount — manually set the unread badge count. */
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    /** setFCMToken — store the device FCM token. */
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ── fetchNotifications ──
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── markNotificationRead ──
    builder
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notifId = action.payload;
        const idx = state.notifications.findIndex((n) => n.id === notifId);
        if (idx !== -1 && !state.notifications[idx].read) {
          state.notifications[idx] = {
            ...state.notifications[idx],
            read: true,
          };
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── markAllNotificationsRead ──
    builder
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── setupPushNotifications ──
    builder
      .addCase(setupPushNotifications.fulfilled, (state, action) => {
        state.fcmToken = action.payload;
      })
      .addCase(setupPushNotifications.rejected, (state, action) => {
        // Non-critical — log but don't block the user
        state.error = action.payload;
      });
  },
});

export const {
  setNotifications,
  addNotification,
  setUnreadCount,
  setFCMToken,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
