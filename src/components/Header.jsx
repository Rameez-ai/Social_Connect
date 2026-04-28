import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';

const Header = ({
  title,
  onBackPress,
  rightComponent,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightComponent && (
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  backText: {
    fontSize: FONT_SIZES.xl,
    color: colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;
