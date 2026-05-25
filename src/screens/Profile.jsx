import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  Header,
  CustomButton,
  UserAvatar,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { userService } from '../services/userService';
import { setProfileData, setLoading } from '../redux/slices/userSlice';

const Profile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { profileData } = useSelector(state => state.user);
  const [editingMode, setEditingMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      dispatch(setLoading(true));
      // Load profile data from Firebase
      const data = {
        id: user?.uid,
        name: user?.displayName || 'User',
        bio: 'Digital nomad and UI explorer.',
        followers: 1200,
        following: 842,
        posts: 45,
        profileImage: user?.photoURL,
        posts: [
          {
            id: '1',
            image: 'https://via.placeholder.com/150',
            title: 'Post 1',
          },
          {
            id: '2',
            image: 'https://via.placeholder.com/150',
            title: 'Post 2',
          },
        ],
      };
      dispatch(setProfileData(data));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const profile = profileData || {
    name: user?.displayName || 'User',
    bio: 'Bio goes here',
    followers: 0,
    following: 0,
    posts: 0,
    profileImage: user?.photoURL,
    posts: [],
  };

  const renderGridPost = ({ item }) => (
    <TouchableOpacity style={styles.gridPost}>
      <Image source={{ uri: item.image }} style={styles.gridPostImage} />
      <View style={styles.postOverlay}>
        <Text style={styles.overlayText}>❤️ 324</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListPost = ({ item }) => (
    <TouchableOpacity style={styles.listPost}>
      <Image source={{ uri: item.image }} style={styles.listPostImage} />
      <View style={styles.listPostInfo}>
        <Text style={styles.listPostTitle}>{item.title}</Text>
        <Text style={styles.listPostStats}>❤️ 324  💬 18</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Profile"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <UserAvatar
            size="lg"
            source={
              profile.profileImage
                ? { uri: profile.profileImage }
                : null
            }
            name={profile.name}
          />
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileHandle}>@{profile.name.toLowerCase().replace(' ', '_')}</Text>
          <Text style={styles.profileBio}>{profile.bio}</Text>

          {editingMode ? (
            <View style={styles.buttonGroup}>
              <CustomButton
                title="Save Changes"
                onPress={() => setEditingMode(false)}
                style={styles.saveButton}
              />
              <TouchableOpacity onPress={() => setEditingMode(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CustomButton
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              variant="outline"
              style={styles.editButton}
            />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'grid' && styles.tabActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={styles.tabIcon}>📐</Text>
            <Text style={styles.tabText}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'list' && styles.tabActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={styles.tabText}>List</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <Text style={styles.postsTitle}>Past Posts</Text>
        {viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            <FlatList
              data={profile.posts}
              renderItem={renderGridPost}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        ) : (
          <FlatList
            data={profile.posts}
            renderItem={renderListPost}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
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
    paddingBottom: SPACING.xl,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: SPACING.md,
  },
  profileHandle: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
  },
  profileBio: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonGroup: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  editButton: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  saveButton: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  cancelText: {
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  postsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
    padding: SPACING.lg,
  },
  gridContainer: {
    paddingHorizontal: SPACING.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridPost: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    position: 'relative',
  },
  gridPostImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  overlayText: {
    color: colors.surface,
    fontWeight: '600',
  },
  listPost: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listPostImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  listPostInfo: {
    flex: 1,
  },
  listPostTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  listPostStats: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
  },
});

export default Profile;
