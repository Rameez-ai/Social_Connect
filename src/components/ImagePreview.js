/**
 * ImagePreview.js
 * --------------
 * A clean, full-screen image preview modal.
 * Used during post creation to preview picked media before uploading.
 *
 * @module components/ImagePreview
 */

import React, { useMemo } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImagePreview = ({ visible, imageUri, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Full screen preview image */}
        <FastImage
          style={styles.image}
          source={{ uri: imageUri }}
          resizeMode={FastImage.resizeMode.contain}
        />

        {/* Top Control Panel: Close Button */}
        <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Control Panel: Confirm Button */}
        {onConfirm && (
          <TouchableOpacity activeOpacity={0.8} onPress={onConfirm} style={styles.confirmButton}>
            <Icon name="checkmark" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    confirmButton: {
      position: 'absolute',
      bottom: 50,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  });

export default React.memo(ImagePreview);
