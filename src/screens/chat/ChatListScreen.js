/**
 * ChatListScreen.js
 * -----------------
 * Displays a searchable list of conversations with real-time updates.
 * Each conversation item shows the other user's avatar, name, last message,
 * and a timestamp.  Tapping navigates to ChatThreadScreen.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTheme } from '../../utils/theme';

dayjs.extend(relativeTime);

// ─── Constants ──────────────────────────────────────────────────────────────────
const AVATAR_SIZE = 56;
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/cccccc/969696?text=User';

// ─── Component ──────────────────────────────────────────────────────────────────
const ChatListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const currentUser = useSelector((state) => state.auth.user);

  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userCache, setUserCache] = useState({}); // uid → user data

  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Real-time listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = firestore()
      .collection('conversations')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('lastMessageAt', 'desc')
      .onSnapshot(
        async (snapshot) => {
          try {
            const convos = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Resolve other user data
            const otherUserIds = convos.map((c) =>
              c.participants?.find((p) => p !== currentUser.uid),
            ).filter(Boolean);

            const newIds = otherUserIds.filter((id) => !userCache[id]);
            if (newIds.length > 0) {
              const userDocs = await Promise.all(
                newIds.map((id) => firestore().collection('users').doc(id).get()),
              );
              const newCache = { ...userCache };
              userDocs.forEach((doc) => {
                if (doc.exists) {
                  newCache[doc.id] = { uid: doc.id, ...doc.data() };
                }
              });
              setUserCache(newCache);
            }

            setConversations(convos);
            setLoading(false);
          } catch (error) {
            console.warn('ChatListScreen – snapshot error:', error);
            setLoading(false);
          }
        },
        (error) => {
          console.warn('ChatListScreen – listener error:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  // ── Filter on search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = conversations.filter((c) => {
      const otherUserId = c.participants?.find((p) => p !== currentUser?.uid);
      const otherUser = userCache[otherUserId];
      const name = (otherUser?.displayName || otherUser?.username || '').toLowerCase();
      return name.includes(q);
    });
    setFilteredConversations(filtered);
  }, [searchQuery, conversations, currentUser?.uid, userCache]);

  // ── Pull-to-refresh (re-trigger listener via state) ─────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Small delay so the user sees the spinner
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  // ── Navigate to thread ──────────────────────────────────────────────────────
  const handleOpenThread = useCallback(
    (conversation) => {
      const otherUserId = conversation.participants?.find((p) => p !== currentUser?.uid);
      const otherUser = userCache[otherUserId] || { uid: otherUserId };
      navigation.navigate('ChatThread', {
        conversationId: conversation.id,
        otherUser,
      });
    },
    [currentUser?.uid, navigation, userCache],
  );

  // ── Conversation item ───────────────────────────────────────────────────────
  const renderConversation = useCallback(
    ({ item }) => {
      const otherUserId = item.participants?.find((p) => p !== currentUser?.uid);
      const otherUser = userCache[otherUserId] || {};

      const lastTime = item.lastMessageAt?.toDate
        ? dayjs(item.lastMessageAt.toDate()).fromNow()
        : '';

      return (
        <TouchableOpacity
          style={styles.convoItem}
          onPress={() => handleOpenThread(item)}
          activeOpacity={0.7}
        >
          <FastImage
            style={styles.avatar}
            source={{
              uri: otherUser?.profilePicture || DEFAULT_AVATAR,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.convoInfo}>
            <View style={styles.convoTopRow}>
              <Text style={styles.convoName} numberOfLines={1}>
                {otherUser?.displayName || otherUser?.username || 'User'}
              </Text>
              <Text style={styles.convoTime}>{lastTime}</Text>
            </View>
            <Text style={styles.convoLastMsg} numberOfLines={1}>
              {item.lastMessage || 'Start a conversation'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [currentUser?.uid, userCache, styles, handleOpenThread],
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () =>
      !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubbles-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation by visiting someone's profile and tapping "Message".
          </Text>
        </View>
      ) : null,
    [loading, styles, theme],
  );

  // ── Loading gate ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversation list */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </View>
  );
};

// ─── Styles factory ─────────────────────────────────────────────────────────────
const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    /* ── Header ── */
    header: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    /* ── Search ── */
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 10,
      backgroundColor: theme.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.textPrimary,
      paddingVertical: 0,
    },
    /* ── Conversation item ── */
    convoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    convoInfo: {
      flex: 1,
      marginLeft: 12,
    },
    convoTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    convoName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    convoTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    convoLastMsg: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    /* ── Empty ── */
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

export default React.memo(ChatListScreen);
