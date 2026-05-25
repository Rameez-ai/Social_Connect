/**
 * ChatBubble.js
 * 
 * Displays a single chat message in a bubble layout.
 * - Sent (own) messages: right-aligned with Instagram gradient background.
 * - Received messages: left-aligned with the theme's surface color.
 * 
 * Shows message text, a compact timestamp, and a read receipt
 * indicator (double-check icon) for sent messages.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useTheme } from '../utils/theme';

// Gradient colors for sent (own) messages — Instagram purple → red
const SENT_GRADIENT = ['#833AB4', '#FD1D1D'];

/**
 * Formats a timestamp into a short time string (e.g., "10:24 AM").
 * @param {object|Date|number} timestamp - Firestore Timestamp, Date, or epoch ms.
 * @returns {string} Formatted time string.
 */
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp?.toDate) return dayjs(timestamp.toDate()).format('h:mm A');
  return dayjs(timestamp).format('h:mm A');
};

const ChatBubble = ({ message, isOwn }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!message) return null;

  /**
   * Renders the inner content of the bubble (text + metadata row).
   * Separated so it can be wrapped in either a View or a LinearGradient.
   */
  const renderContent = () => (
    <>
      {/* Message text */}
      <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
        {message.text}
      </Text>

      {/* Bottom row: timestamp + read receipt */}
      <View style={styles.metaRow}>
        <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
          {formatTime(message.createdAt)}
        </Text>

        {/* Read receipt for own messages */}
        {isOwn && (
          <Icon
            name={message.read ? 'checkmark-done' : 'checkmark'}
            size={14}
            color={message.read ? '#4FC3F7' : 'rgba(255,255,255,0.6)'}
            style={styles.readIcon}
          />
        )}
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {isOwn ? (
        // Sent message: gradient background
        <LinearGradient
          colors={SENT_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bubble, styles.ownBubble]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        // Received message: surface-colored background
        <View style={[styles.bubble, styles.otherBubble]}>
          {renderContent()}
        </View>
      )}
    </View>
  );
};

/**
 * Creates theme-aware styles for ChatBubble.
 * @param {object} theme - Current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 3,
      paddingHorizontal: 12,
    },
    ownContainer: {
      alignItems: 'flex-end',
    },
    otherContainer: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    ownBubble: {
      borderBottomRightRadius: 4, // Tail effect on bottom-right
    },
    otherBubble: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 4, // Tail effect on bottom-left
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
      color: theme.colors.text,
    },
    ownMessageText: {
      color: '#FFFFFF',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
    },
    timestamp: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    ownTimestamp: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    readIcon: {
      marginLeft: 4,
    },
  });

export default React.memo(ChatBubble);
