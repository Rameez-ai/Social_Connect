/**
 * App.js
 * ------
 * Main entry point for the Social Connect React Native application.
 * Set up all global context providers in their correct order:
 *   1. GestureHandlerRootView (for reanimated/gesture-handler animations)
 *   2. Redux Provider (global state management)
 *   3. ThemeProvider (light / dark appearance context)
 *   4. SafeAreaProvider (safe area padding calculations)
 *
 * Configures the theme-aware StatusBar and registers the background
 * push notification message handler on boot.
 */

// Import gesture handler as the absolute first import (React Navigation requirement)
import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import store from './src/store';
import { ThemeProvider, useTheme } from './src/utils/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { setupBackgroundHandler } from './src/services/notificationService';

// ─── Push Notifications Background Registration ──────────────────────────────
// Must be registered outside of any React lifecycle/components to handle
// incoming messages when the app is in the background or fully terminated.
setupBackgroundHandler();

/**
 * MainAppContent — Helper component to consume the active theme
 * and configure the phone's StatusBar dynamically.
 */
const MainAppContent = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={theme.colors.statusBar}
        backgroundColor={theme.colors.headerBackground}
        translucent={false}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
};

/**
 * Root App Component
 */
const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <ThemeProvider>
          <MainAppContent />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
