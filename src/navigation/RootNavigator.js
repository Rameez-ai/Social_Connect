/**
 * RootNavigator.js
 * -------------
 * The core entry point for application navigation.
 * Uses the custom `useAuth` hook to evaluate if the user is authenticated.
 * If authenticated → mounts AppStack, otherwise → mounts AuthStack.
 *
 * Renders a full screen loading splash while loading the auth state.
 *
 * @module navigation/RootNavigator
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../utils/theme';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootNavigator = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Render full screen loading splash during initialisation
  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    splashContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default RootNavigator;
