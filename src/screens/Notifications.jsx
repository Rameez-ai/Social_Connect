import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Header,
  CustomButton,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';

const Notifications = ({ navigation }) => {
  const notifications = [
    {
      id: '1',
      type: 'like',
      user: 'John Doe',
      action: 'liked your post',
      post: 'about Minimalist UI Patterns.',
      avatar: 'https://via.placeholder.com/48',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'comment',
      user: 'Sarah Jenkins',
      action: 'commented on your photo',
      post: '"This composition is absolutely stunning!"',
      avatar: 'https://via.placeholder.com/48',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'follow',
      user: 'Michael Chen',
      action: 'started following you',
      post: null,
      avatar: 'https://via.placeholder.com/48',
      time: '3 hours ago',
      read: false,
    },
    {
      id: '4',
      type: 'mention',
      user: 'Elena Rodriguez',
      action: 'mentioned you in a post',
      post: '"Hey @user, check out this amazing design case study!"',
      avatar: 'https://via.placeholder.com/48',
      time: 'Yesterday at 4:20 PM',
      read: true,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '📢';
    }
  };

  const renderNotification = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.notificationItem, !item.read && styles.notificationItemNew]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.action}>{item.action}</Text>
        {item.post && <Text style={styles.post}>{item.post}</Text>}
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const newNotifications = notifications.filter(n => !n.read);
  const oldNotifications = notifications.filter(n => n.read);

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        rightComponent={
          <TouchableOpacity>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {newNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>New</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{newNotifications.length}</Text>
            </View>
          </>
        )}

        {newNotifications.map(renderNotification)}

        {oldNotifications.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Yesterday</Text>
            {oldNotifications.map(renderNotification)}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>Start following people to see their updates</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  badgeText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationItemNew: {
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
  },
  action: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  post: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
  },
});

export default Notifications;
