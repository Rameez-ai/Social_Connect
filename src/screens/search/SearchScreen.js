/**
 * SearchScreen.js
 * 
 * Search screen for finding users and posts.
 * Features:
 * - Search bar at top with search icon and clear button
 * - Segmented control tabs: 'Users' | 'Posts'
 * - Users tab: FlatList of UserCard components from search results
 * - Posts tab: FlatList of PostCard components matching text query
 * - Debounced search (300ms delay) to avoid excessive Firestore queries
 * - EmptyState for no results
 * - Recent searches stored in local state
 * - Loading indicator while searching
 * - Uses userService.searchUsers and postService for searching
 */

import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Keyboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../utils/theme';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import UserCard from '../../components/user/UserCard';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');
const TABS = ['Users', 'Posts'];
const DEBOUNCE_DELAY = 300; // milliseconds

const SearchScreen = () => {
  // ─── Hooks ────────────────────────────────────────────────
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);

  // ─── Refs ─────────────────────────────────────────────────
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // ─── Local State ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Users, 1 = Posts
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // ─── Debounced Search ─────────────────────────────────────
  useEffect(() => {
    /**
     * Debounce the search query to avoid firing Firestore queries
     * on every keystroke. Waits 300ms after the user stops typing.
     */
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      // Reset results when query is cleared
      setUserResults([]);
      setPostResults([]);
      setHasSearched(false);
      setSearching(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, DEBOUNCE_DELAY);

    // Cleanup timer on unmount or query change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Search Logic ─────────────────────────────────────────

  /**
   * Perform the search across users and posts.
   * Fetches results from Firestore via service layers.
   */
  const performSearch = useCallback(
    async (query) => {
      if (!query) return;

      setSearching(true);
      setHasSearched(true);

      try {
        // Search both users and posts in parallel
        const [users, posts] = await Promise.all([
          userService.searchUsers(query),
          postService.searchPosts(query),
        ]);

        setUserResults(users || []);
        setPostResults(posts || []);

        // Add to recent searches (avoid duplicates, keep last 10)
        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          );
          return [query, ...filtered].slice(0, 10);
        });
      } catch (err) {
        console.error('Error performing search:', err);
        setUserResults([]);
        setPostResults([]);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  // ─── Handlers ─────────────────────────────────────────────

  /** Clear the search input and results */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setUserResults([]);
    setPostResults([]);
    setHasSearched(false);
    searchInputRef.current?.focus();
  }, []);

  /** Handle tab switch */
  const handleTabPress = useCallback((index) => {
    setActiveTab(index);
  }, []);

  /** Handle tapping a recent search to re-search */
  const handleRecentSearchPress = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /** Clear all recent searches */
  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  /** Navigate to user profile */
  const handleUserPress = useCallback(
    (userId) => {
      navigation.navigate('Profile', { userId });
    },
    [navigation]
  );

  /** Navigate to post detail */
  const handlePostPress = useCallback(
    (post) => {
      navigation.navigate('PostDetail', { postId: post.id });
    },
    [navigation]
  );

  // ─── Render Helpers ───────────────────────────────────────

  /** Key extractor for users */
  const userKeyExtractor = useCallback((item) => item.id || item.uid, []);

  /** Key extractor for posts */
  const postKeyExtractor = useCallback((item) => item.id, []);

  /** Render user card */
  const renderUserItem = useCallback(
    ({ item }) => (
      <UserCard
        user={item}
        onPress={() => handleUserPress(item.uid || item.id)}
        currentUserId={user?.uid}
      />
    ),
    [handleUserPress, user?.uid]
  );

  /** Render post card */
  const renderPostItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={() => handlePostPress(item)}
        currentUserId={user?.uid}
      />
    ),
    [handlePostPress, user?.uid]
  );

  /** Render separator */
  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: theme.border }]}
      />
    ),
    [theme.border]
  );

  /** Render empty state for search results */
  const renderEmptyResults = useCallback(() => {
    if (searching) return null;
    if (!hasSearched) return null;

    return (
      <EmptyState
        icon="search-outline"
        title="No results found"
        message={`No ${
          activeTab === 0 ? 'users' : 'posts'
        } found matching "${searchQuery}"`}
      />
    );
  }, [searching, hasSearched, activeTab, searchQuery]);

  // ─── Current Results ──────────────────────────────────────
  const currentResults = activeTab === 0 ? userResults : postResults;

  // ─── Main Render ──────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* ─── Search Bar ──────────────────────────────────── */}
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Icon
            name="search-outline"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search users or posts..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── Segmented Tab Control ───────────────────────── */}
      <View
        style={[
          styles.tabContainer,
          { borderBottomColor: theme.border },
        ]}
      >
        {TABS.map((tab, index) => {
          const isActive = index === activeTab;
          const resultCount =
            index === 0 ? userResults.length : postResults.length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? '#833AB4' : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab}
                {hasSearched && resultCount > 0 && (
                  <Text style={styles.tabCount}> ({resultCount})</Text>
                )}
              </Text>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Content ─────────────────────────────────────── */}
      {searching ? (
        /* Loading indicator while searching */
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Searching...
          </Text>
        </View>
      ) : !hasSearched && searchQuery.length === 0 ? (
        /* Show recent searches when no active search */
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <Text
                  style={[styles.recentTitle, { color: theme.text }]}
                >
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={handleClearRecent}>
                  <Text style={styles.clearRecentText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {recentSearches.map((query, index) => (
                <TouchableOpacity
                  key={`${query}-${index}`}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(query)}
                >
                  <Icon
                    name="time-outline"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.recentIcon}
                  />
                  <Text
                    style={[styles.recentText, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {query}
                  </Text>
                  <Icon
                    name="arrow-forward"
                    size={16}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            /* No recent searches – show explore prompt */
            <EmptyState
              icon="search-outline"
              title="Search Social Connect"
              message="Find users and posts by typing in the search bar above"
            />
          )}
        </View>
      ) : (
        /* Search results */
        <FlatList
          data={currentResults}
          renderItem={activeTab === 0 ? renderUserItem : renderPostItem}
          keyExtractor={activeTab === 0 ? userKeyExtractor : postKeyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyResults}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            currentResults.length === 0 && styles.emptyListContent,
          ]}
          onScrollBeginDrag={Keyboard.dismiss}
        />
      )}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Search bar
  searchBarContainer: {
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
  },
  tabCount: {
    fontSize: 12,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2.5,
    backgroundColor: '#833AB4',
    borderRadius: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },

  // Search results list
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },

  // Recent searches
  recentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearRecentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#833AB4',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
  },
});

export default React.memo(SearchScreen);
