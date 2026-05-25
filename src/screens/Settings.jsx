import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  Header,
  CustomButton,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { logout } from '../redux/slices/authSlice';

const Settings = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const SettingItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>{icon && <Text style={styles.icon}>{icon}</Text>}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Preferences */}
        <SectionHeader title="ACCOUNT PREFERENCES" />
        <SettingItem
          icon="👤"
          title="Edit Profile"
          subtitle="Update your personal information and bio"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="🔒"
          title="Change Password"
          subtitle="Manage your account security"
          onPress={() => {}}
        />

        {/* Security & Data */}
        <SectionHeader title="SECURITY & DATA" />
        <SettingItem
          icon="🛡️"
          title="Privacy Settings"
          subtitle="Control who sees your posts and activity"
          onPress={() => {}}
        />
        <SettingItem
          icon="📱"
          title="Connected Apps"
          subtitle="Manage apps connected to your account"
          onPress={() => {}}
        />
        <SettingItem
          icon="🔔"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => {}}
        />

        {/* Support */}
        <SectionHeader title="SUPPORT" />
        <SettingItem
          icon="📖"
          title="Help Center"
          subtitle="Get help and find answers"
          onPress={() => {}}
        />
        <SettingItem
          icon="📧"
          title="Contact Support"
          subtitle="Reach out to our support team"
          onPress={() => {}}
        />
        <SettingItem
          icon="📋"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => {}}
        />
        <SettingItem
          icon="🔐"
          title="Privacy Policy"
          subtitle="Learn about our privacy practices"
          onPress={() => {}}
        />

        {/* App Info */}
        <SectionHeader title="APP INFO" />
        <View style={styles.appInfoItem}>
          <Text style={styles.appInfoLabel}>App Version</Text>
          <Text style={styles.appInfoValue}>2.4.0 (Build 892)</Text>
        </View>

        {/* Logout */}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by Social Connect</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    marginRight: SPACING.lg,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
  },
  arrow: {
    fontSize: FONT_SIZES.lg,
    color: colors.textTertiary,
    marginLeft: SPACING.md,
  },
  appInfoItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfoLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  appInfoValue: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
  },
});

export default Settings;
