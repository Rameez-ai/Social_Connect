/**
 * EmptyState.js
 * ------------
 * A reusable component to display when a list is empty.
 * Renders a centered layout with an icon, title, description, and an optional call-to-action button.
 *
 * @module components/EmptyState
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../utils/theme';

const EmptyState = ({
  icon = 'document-text-outline',
  title = 'No Data Available',
  message = 'There is nothing to display here yet.',
  actionText,
  onAction,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onAction && (
        <TouchableOpacity activeOpacity={0.8} onPress={onAction} style={styles.buttonContainer}>
          <LinearGradient
            colors={theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 48,
    },
    iconContainer: {
      marginBottom: 16,
      opacity: 0.8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 200,
    },
    button: {
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default React.memo(EmptyState);
