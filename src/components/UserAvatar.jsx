import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { getInitials } from '../utils/helpers';

const UserAvatar = ({
  size = 'md',
  source,
  name,
  onPress,
  style,
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.avatar_sm;
      case 'lg':
        return styles.avatar_lg;
      default:
        return styles.avatar_md;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.initials_sm;
      case 'lg':
        return styles.initials_lg;
      default:
        return styles.initials_md;
    }
  };

  const content = (
    <View style={[styles.container, getSizeStyle(), style]}>
      {source ? (
        <Image source={source} style={[styles.image, getSizeStyle()]} />
      ) : (
        <Text style={[styles.initials, getTextSizeStyle()]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  image: {
    resizeMode: 'cover',
  },
  avatar_sm: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatar_md: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatar_lg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  initials: {
    fontWeight: '700',
    color: colors.surface,
  },
  initials_sm: {
    fontSize: FONT_SIZES.sm,
  },
  initials_md: {
    fontSize: FONT_SIZES.md,
  },
  initials_lg: {
    fontSize: FONT_SIZES.xl,
  },
});

export default UserAvatar;
