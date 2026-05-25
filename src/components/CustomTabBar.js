/**
 * CustomTabBar.js
 * ------------
 * A beautiful, custom bottom tab bar component designed to match the
 * Instagram-inspired theme of Social Connect.
 *
 * Renders a row of tabs with smooth press scale animations.
 * The middle 'Create' button is larger and styled with the iconic brand gradient.
 * Respects system light/dark theme styling.
 *
 * @module components/CustomTabBar
 */

import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Tab Icon mapper
  const getIconName = (routeName, isFocused) => {
    switch (routeName) {
      case 'Home':
        return isFocused ? 'home' : 'home-outline';
      case 'Search':
        return isFocused ? 'search' : 'search-outline';
      case 'Chat':
        return isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
      case 'Profile':
        return isFocused ? 'person' : 'person-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Custom press event handler
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Render the special center "Create Post" button
        if (route.name === 'CreatePostTab' || route.name === 'CreatePost') {
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.85}
              onPress={onPress}
              style={styles.createButtonContainer}
            >
              <LinearGradient
                colors={theme.colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButton}
              >
                <Icon name="add" size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        // Standard navigation tabs
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.6}
          >
            <Icon
              name={getIconName(route.name, isFocused)}
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.tabBarBackground,
      height: Platform.OS === 'ios' ? 88 : 64,
      borderTopWidth: 1,
      borderTopColor: theme.colors.tabBarBorder,
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: Platform.OS === 'ios' ? 24 : 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    tabButton: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    createButtonContainer: {
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      top: Platform.OS === 'ios' ? -12 : -16,
      zIndex: 10,
    },
    createButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });

export default React.memo(CustomTabBar);
