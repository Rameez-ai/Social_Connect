import React from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error = null,
  leftIcon = null,
  rightIcon = null,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainer_error]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.surface,
  },
  inputContainer_error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: colors.text,
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  error: {
    color: colors.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
});

export default CustomInput;
