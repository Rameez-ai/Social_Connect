/**
 * ConfirmDialog.js
 * ---------------
 * A reusable modal alert dialogue.
 * Prompts user with custom title, body text, cancel and confirm buttons.
 * Supports standard or red (destructive) action styling.
 *
 * @module components/ConfirmDialog
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ConfirmDialog = ({
  visible,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, destructive), [theme, destructive]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton]}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme, destructive) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      maxWidth: SCREEN_WIDTH * 0.85,
      padding: 24,
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    message: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
      marginRight: 12,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    confirmButton: {
      backgroundColor: destructive ? theme.colors.error : theme.colors.primary,
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

export default React.memo(ConfirmDialog);
