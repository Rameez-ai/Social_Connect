/**
 * SettingsScreen.js
 * -----------------
 * Full settings panel with sections for Appearance, Account, Notifications,
 * About, and Logout.  Supports dark/light theme toggle via ThemeContext.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

import { useTheme } from '../../utils/theme';
import { logout } from '../../redux/slices/authSlice';

// ─── Constants ──────────────────────────────────────────────────────────────────
const APP_VERSION = '1.0.0';

// ─── Component ──────────────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const currentUser = useSelector((state) => state.auth.user);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Dark-mode toggle ────────────────────────────────────────────────────────
  const handleToggleDarkMode = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // ── Push notification toggle ────────────────────────────────────────────────
  const handleTogglePush = useCallback(async () => {
    try {
      if (pushEnabled) {
        // Disable
        await messaging().deleteToken();
        setPushEnabled(false);
      } else {
        // Enable
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          await messaging().getToken();
          setPushEnabled(true);
        } else {
          Alert.alert(
            'Permission Denied',
            'Please enable push notifications in your device settings.',
          );
        }
      }
    } catch (error) {
      console.warn('SettingsScreen – push toggle error:', error);
      Alert.alert('Error', 'Could not update notification settings.');
    }
  }, [pushEnabled]);

  // ── Change password (send reset email) ──────────────────────────────────────
  const handleChangePassword = useCallback(async () => {
    const email = currentUser?.email;
    if (!email) {
      Alert.alert('Error', 'No email address found for this account.');
      return;
    }

    setSendingReset(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Email Sent',
        `A password reset link has been sent to ${email}. Please check your inbox.`,
      );
    } catch (error) {
      console.warn('SettingsScreen – password reset error:', error);
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    } finally {
      setSendingReset(false);
    }
  }, [currentUser?.email]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await auth().signOut();
            dispatch(logout());
          } catch (error) {
            console.warn('SettingsScreen – logout error:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }, [dispatch]);

  // ── Section renderer ────────────────────────────────────────────────────────
  const renderSectionHeader = useCallback(
    (title) => <Text style={styles.sectionHeader}>{title}</Text>,
    [styles],
  );

  const renderItem = useCallback(
    ({ icon, label, onPress, rightComponent, danger = false }) => (
      <TouchableOpacity
        style={styles.settingsItem}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.6 : 1}
      >
        <View style={styles.itemLeft}>
          <Icon
            name={icon}
            size={22}
            color={danger ? '#FD1D1D' : theme.textPrimary}
            style={styles.itemIcon}
          />
          <Text style={[styles.itemLabel, danger && styles.dangerText]}>
            {label}
          </Text>
        </View>
        {rightComponent || (
          onPress ? (
            <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
          ) : null
        )}
      </TouchableOpacity>
    ),
    [styles, theme],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appearance ── */}
        {renderSectionHeader('Appearance')}
        <View style={styles.section}>
          {renderItem({
            icon: isDark ? 'moon' : 'sunny',
            label: 'Dark Mode',
            rightComponent: (
              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={Platform.OS === 'android' ? (isDark ? theme.primary : '#f4f3f4') : undefined}
              />
            ),
          })}
        </View>

        {/* ── Account ── */}
        {renderSectionHeader('Account')}
        <View style={styles.section}>
          {renderItem({
            icon: 'person-outline',
            label: 'Edit Profile',
            onPress: () => navigation.navigate('EditProfile'),
          })}
          {renderItem({
            icon: 'lock-closed-outline',
            label: sendingReset ? 'Sending...' : 'Change Password',
            onPress: handleChangePassword,
            rightComponent: sendingReset ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : undefined,
          })}
        </View>

        {/* ── Notifications ── */}
        {renderSectionHeader('Notifications')}
        <View style={styles.section}>
          {renderItem({
            icon: 'notifications-outline',
            label: 'Push Notifications',
            rightComponent: (
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePush}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={Platform.OS === 'android' ? (pushEnabled ? theme.primary : '#f4f3f4') : undefined}
              />
            ),
          })}
        </View>

        {/* ── About ── */}
        {renderSectionHeader('About')}
        <View style={styles.section}>
          {renderItem({
            icon: 'information-circle-outline',
            label: `App Version ${APP_VERSION}`,
          })}
          {renderItem({
            icon: 'document-text-outline',
            label: 'Terms of Service',
            onPress: () => Linking.openURL('https://example.com/terms'),
          })}
          {renderItem({
            icon: 'shield-checkmark-outline',
            label: 'Privacy Policy',
            onPress: () => Linking.openURL('https://example.com/privacy'),
          })}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FD1D1D" />
          ) : (
            <>
              <Icon name="log-out-outline" size={22} color="#FD1D1D" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Styles factory ─────────────────────────────────────────────────────────────
const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    /* ── Header ── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    /* ── Sections ── */
    sectionHeader: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
    },
    section: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    /* ── Item ── */
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    itemIcon: {
      marginRight: 14,
    },
    itemLabel: {
      fontSize: 16,
      color: theme.textPrimary,
    },
    dangerText: {
      color: '#FD1D1D',
    },
    /* ── Logout ── */
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
      marginTop: 32,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#FD1D1D',
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FD1D1D',
    },
  });

export default React.memo(SettingsScreen);
