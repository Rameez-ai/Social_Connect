/**
 * SkeletonLoader.js
 * ----------------
 * Placeholder loading state component using pulse animations.
 * Provides custom layouts for: 'post' (feed posts), 'profile' (grid + details), and 'chat' (bubble list).
 *
 * Uses react-native-reanimated for smooth 60fps animations.
 *
 * @module components/SkeletonLoader
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkeletonLoader = ({ type = 'post', count = 1 }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Shared value for driving shimmer opacity
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Pulse animation from 0.3 opacity to 0.7 opacity, repeating infinitely
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1, // infinite repetitions
      true // reverse on each loop (alternate)
    );
  }, [opacity]);

  // Animated styles applied to all skeleton bones
  const animatedBoneStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  /** Renders a single post card skeleton bone */
  const renderPostSkeleton = (index) => (
    <View key={`post-skele-${index}`} style={styles.postContainer}>
      {/* Header (avatar + name) */}
      <View style={styles.postHeader}>
        <Animated.View style={[styles.avatarBone, animatedBoneStyle]} />
        <View style={styles.postHeaderTexts}>
          <Animated.View style={[styles.textLineBoneShort, animatedBoneStyle]} />
          <Animated.View style={[styles.textLineBoneTiny, animatedBoneStyle]} style={[styles.textLineBoneTiny, animatedBoneStyle, { marginTop: 4 }]} />
        </View>
      </View>
      {/* Text body */}
      <View style={styles.postBodyText}>
        <Animated.View style={[styles.textLineBoneLong, animatedBoneStyle]} />
        <Animated.View style={[styles.textLineBoneMedium, animatedBoneStyle, { marginTop: 6 }]} />
      </View>
      {/* Large Image block */}
      <Animated.View style={[styles.postImageBone, animatedBoneStyle]} />
      {/* Footer bar */}
      <View style={styles.postFooter}>
        <Animated.View style={[styles.actionIconBone, animatedBoneStyle]} />
        <Animated.View style={[styles.actionIconBone, animatedBoneStyle, { marginLeft: 16 }]} />
      </View>
    </View>
  );

  /** Renders profile info + post grid skeleton */
  const renderProfileSkeleton = () => (
    <View style={styles.profileContainer}>
      {/* Header Info */}
      <View style={styles.profileHeader}>
        <Animated.View style={[styles.profileAvatarBone, animatedBoneStyle]} />
        <View style={styles.profileStatsContainer}>
          <View style={styles.profileStatsRow}>
            <View style={styles.statBoneCol}>
              <Animated.View style={[styles.statNumBone, animatedBoneStyle]} />
              <Animated.View style={[styles.statLabelBone, animatedBoneStyle]} />
            </View>
            <View style={styles.statBoneCol}>
              <Animated.View style={[styles.statNumBone, animatedBoneStyle]} />
              <Animated.View style={[styles.statLabelBone, animatedBoneStyle]} />
            </View>
            <View style={styles.statBoneCol}>
              <Animated.View style={[styles.statNumBone, animatedBoneStyle]} />
              <Animated.View style={[styles.statLabelBone, animatedBoneStyle]} />
            </View>
          </View>
          <Animated.View style={[styles.profileButtonBone, animatedBoneStyle]} />
        </View>
      </View>

      {/* Bio text */}
      <View style={styles.profileBio}>
        <Animated.View style={[styles.textLineBoneMedium, animatedBoneStyle]} />
        <Animated.View style={[styles.textLineBoneLong, animatedBoneStyle, { marginTop: 6 }]} />
      </View>

      <View style={styles.divider} />

      {/* Post Grid (9 items) */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 9 }).map((_, idx) => (
          <Animated.View key={`grid-skele-${idx}`} style={[styles.gridItemBone, animatedBoneStyle]} />
        ))}
      </View>
    </View>
  );

  /** Renders chat item list skeleton */
  const renderChatSkeleton = (index) => (
    <View key={`chat-skele-${index}`} style={styles.chatContainer}>
      <Animated.View style={[styles.chatAvatarBone, animatedBoneStyle]} />
      <View style={styles.chatTexts}>
        <Animated.View style={[styles.textLineBoneMedium, animatedBoneStyle]} />
        <Animated.View style={[styles.textLineBoneLong, animatedBoneStyle, { marginTop: 6 }]} />
      </View>
      <Animated.View style={[styles.chatTimeBone, animatedBoneStyle]} />
    </View>
  );

  // Main switch logic
  if (type === 'profile') {
    return renderProfileSkeleton();
  }

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => {
        if (type === 'chat') return renderChatSkeleton(idx);
        return renderPostSkeleton(idx);
      })}
    </View>
  );
};

const createStyles = (theme) => {
  const gridItemWidth = (SCREEN_WIDTH - 4) / 3;
  return StyleSheet.create({
    listContainer: {
      flex: 1,
    },
    // --- Common Bones ---
    avatarBone: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.shimmer,
    },
    textLineBoneLong: {
      width: '90%',
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.shimmer,
    },
    textLineBoneMedium: {
      width: '60%',
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.shimmer,
    },
    textLineBoneShort: {
      width: '35%',
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.shimmer,
    },
    textLineBoneTiny: {
      width: '20%',
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.shimmer,
    },
    // --- Post Layout ---
    postContainer: {
      backgroundColor: theme.colors.card,
      marginBottom: 8,
      paddingBottom: 16,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    postHeaderTexts: {
      marginLeft: 10,
      flex: 1,
    },
    postBodyText: {
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    postImageBone: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH,
      backgroundColor: theme.colors.shimmer,
    },
    postFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    actionIconBone: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: theme.colors.shimmer,
    },
    // --- Profile Layout ---
    profileContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    profileAvatarBone: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.shimmer,
    },
    profileStatsContainer: {
      flex: 1,
      marginLeft: 24,
    },
    profileStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statBoneCol: {
      alignItems: 'center',
    },
    statNumBone: {
      width: 32,
      height: 16,
      borderRadius: 4,
      backgroundColor: theme.colors.shimmer,
    },
    statLabelBone: {
      width: 40,
      height: 10,
      borderRadius: 3,
      backgroundColor: theme.colors.shimmer,
      marginTop: 4,
    },
    profileButtonBone: {
      width: '100%',
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.colors.shimmer,
    },
    profileBio: {
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 16,
      marginBottom: 2,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
    gridItemBone: {
      width: gridItemWidth,
      height: gridItemWidth,
      backgroundColor: theme.colors.shimmer,
      margin: 0.6,
    },
    // --- Chat Layout ---
    chatContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    chatAvatarBone: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.shimmer,
    },
    chatTexts: {
      flex: 1,
      marginLeft: 14,
    },
    chatTimeBone: {
      width: 30,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.shimmer,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
  });
};

export default React.memo(SkeletonLoader);
