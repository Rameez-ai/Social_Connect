import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

// Screens
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import ForgotPassword from '../screens/ForgotPassword';
import Home from '../screens/Home';
import CreatePost from '../screens/CreatePost';
import Profile from '../screens/Profile';
import Comments from '../screens/Comments';
import Notifications from '../screens/Notifications';
import Settings from '../screens/Settings';
import EditProfile from '../screens/EditProfile';

import { colors } from '../utils/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={Signup} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  </Stack.Navigator>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="HomeScreen" component={Home} />
    <Stack.Screen name="Comments" component={Comments} />
    <Stack.Screen name="CreatePost" component={CreatePost} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="ProfileScreen" component={Profile} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
    <Stack.Screen name="Settings" component={Settings} />
  </Stack.Navigator>
);

// Notifications Stack
const NotificationsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="NotificationsScreen" component={Notifications} />
  </Stack.Navigator>
);

// App Stack (Main App Navigation with Bottom Tabs)
const AppStack = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarLabelPosition: 'below-icon',
      tabBarLabel: route.name === 'HomeStack' ? 'Home' :
                   route.name === 'NotificationsStack' ? 'Notifications' :
                   'Profile',
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarShowLabel: true,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
      },
      tabBarIcon: ({ focused, color }) => {
        let icon;
        if (route.name === 'HomeStack') {
          icon = focused ? '🏠' : '🏠';
        } else if (route.name === 'NotificationsStack') {
          icon = focused ? '🔔' : '🔔';
        } else if (route.name === 'ProfileStack') {
          icon = focused ? '👤' : '👤';
        }
        return <Text style={{ fontSize: 24 }}>{icon}</Text>;
      },
    })}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{
        title: 'Home',
      }}
    />
    <Tab.Screen
      name="NotificationsStack"
      component={NotificationsStack}
      options={{
        title: 'Notifications',
      }}
    />
    <Tab.Screen
      name="ProfileStack"
      component={ProfileStack}
      options={{
        title: 'Profile',
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
