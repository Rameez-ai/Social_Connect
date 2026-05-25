import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onChange && onChange(!checked)}
    >
      <View style={[styles.checkbox, checked && styles.checkbox_checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkbox_checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    flex: 1,
  },
});

export default Checkbox;
