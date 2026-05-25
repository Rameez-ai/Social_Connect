/**
 * AppTabs.js
 * ----------
 * Bottom Tab Navigator for main authenticated screens.
 * Contains: Home, Search, CreatePost (placeholder), Chat, Profile.
 *
 * Employs a custom, animated bottom tab bar (CustomTabBar) to override
 * tab layouts and style a standout middle brand (+) button.
 *
 * @module navigation/AppTabs
 */

import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

// Placeholder component. When tapped, the tab press is intercepted by CustomTabBar
// and the AppStack opens CreatePost as a fullscreen modal instead.
const CreatePostPlaceholder = () => <View />;

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostPlaceholder}
        options={{
          tabBarLabel: 'Create',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreatePostModal');
          },
        })}
      />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
