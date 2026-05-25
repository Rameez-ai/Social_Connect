/**
 * Toast.js
 * --------
 * A flexible, animated toast/snackbar alert component.
 * Slides up from the bottom of the screen and auto-dismisses after a duration.
 *
 * Uses react-native-reanimated for high-performance slide/fade animations.
 * Consumes theme tokens for backgrounds, text, and semantic coloring (success, error, info).
 *
 * @module components/Toast
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = ({
  visible,
  message,
  type = 'info', // 'success' | 'error' | 'info'
  onDismiss,
  duration = 3500, // auto-dismiss in milliseconds
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, type), [theme, type]);

  // Shared values for driving sliding and opacity animations
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  // Animated styles applied to the container view
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    let timeout;
    if (visible && message) {
      // 1. Slide up and fade in
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });

      // 2. Set auto-dismiss timeout
      timeout = setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      // Hide / Slide down
      translateY.value = withSpring(100, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(0, { duration: 200 });
    }

    return () => clearTimeout(timeout);
  }, [visible, message, duration]);

  const handleDismiss = () => {
    // Slide down before notifying parent
    translateY.value = withSpring(100, { damping: 15, stiffness: 120 }, () => {
      if (onDismiss) {
        onDismiss();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  /** Returns icon name matching the semantic type */
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  };

  if (!visible || !message) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={styles.content}
      >
        <Icon name={getIconName()} size={22} color="#FFFFFF" />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
        <Icon name="close" size={16} color="rgba(255, 255, 255, 0.7)" style={styles.closeIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (theme, type) => {
  // Get background color based on toast type
  let backgroundColor = theme.colors.card;
  if (type === 'success') backgroundColor = theme.colors.success;
  else if (type === 'error') backgroundColor = theme.colors.error;
  else if (type === 'info') backgroundColor = theme.colors.info;

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 50,
      left: 16,
      right: 16,
      alignSelf: 'center',
      zIndex: 9999,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    text: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '500',
      marginLeft: 10,
      marginRight: 24,
      flex: 1,
    },
    closeIcon: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: [{ translateY: -8 }],
    },
  });
};

export default React.memo(Toast);
