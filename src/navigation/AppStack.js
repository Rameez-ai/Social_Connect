/**
 * AppStack.js
 * ----------
 * Main Stack Navigator for the authenticated area of the app.
 * Wraps the Bottom Tab Navigator (AppTabs) and handles all sub-screens
 * like Profiles, Post Details, Comments, Settings, and Direct Chats.
 *
 * Configures the "CreatePost" editor to animate upward as a fullscreen Modal.
 *
 * @module navigation/AppStack
 */

import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AppTabs from './AppTabs';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PostDetailScreen from '../screens/home/PostDetailScreen';
import CommentsScreen from '../screens/home/CommentsScreen';
import EditPostScreen from '../screens/home/EditPostScreen';
import ChatThreadScreen from '../screens/chat/ChatThreadScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import CreatePostScreen from '../screens/home/CreatePostScreen';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // iOS sliding style transitions
        gestureEnabled: true,
      }}
    >
      {/* Bottom Tab Navigation */}
      <Stack.Screen name="MainTabs" component={AppTabs} />

      {/* Profile Stack */}
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      {/* Post & Feed Stack */}
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="EditPost" component={EditPostScreen} />

      {/* Chat Stack */}
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />

      {/* Settings Stack */}
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Modal - Create Post Screen (Animate from Bottom) */}
      <Stack.Screen
        name="CreatePostModal"
        component={CreatePostScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // Slide up from bottom
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
