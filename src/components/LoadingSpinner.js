/**
 * LoadingSpinner.js
 * 
 * Full-screen semi-transparent loading overlay.
 * Shows a centered ActivityIndicator with an optional text label below it.
 * Controlled by the `visible` prop.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTheme } from '../utils/theme';

const LoadingSpinner = ({ visible = false, text }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          {text ? (
            <Text style={styles.loadingText}>{text}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

/**
 * Creates theme-aware styles for LoadingSpinner.
 * @param {object} theme - Current theme object.
 * @returns {object} StyleSheet styles.
 */
const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinnerContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      paddingHorizontal: 32,
      paddingVertical: 24,
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    loadingText: {
      marginTop: 14,
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

export default React.memo(LoadingSpinner);
