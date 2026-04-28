import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';

const Card = ({ children, style, title, subtitle }) => {
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginBottom: SPACING.md,
  },
});

export default Card;
