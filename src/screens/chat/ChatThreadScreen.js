/**
 * ChatThreadScreen.js
 * -------------------
 * Real-time chat thread between the current user and another user.
 * Uses an inverted FlatList for message ordering, Firestore onSnapshot
 * for real-time updates, and a bottom input bar with KeyboardAvoidingView.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';

import { useTheme } from '../../utils/theme';

// ─── Constants ──────────────────────────────────────────────────────────────────
const AVATAR_SIZE = 36;
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/cccccc/969696?text=User';

// ─── Component ──────────────────────────────────────────────────────────────────
const ChatThreadScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const { conversationId, otherUser } = route.params;
  const currentUser = useSelector((state) => state.auth.user);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── Subscribe to messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(msgs);
          setLoading(false);
        },
        (error) => {
          console.warn('ChatThreadScreen – messages listener error:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [conversationId]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    try {
      const messageData = {
        text: trimmed,
        senderId: currentUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      // Add message to sub-collection
      await firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add(messageData);

      // Update conversation meta
      await firestore().collection('conversations').doc(conversationId).update({
        lastMessage: trimmed,
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.warn('ChatThreadScreen – send error:', error);
      setText(trimmed); // Restore text so user can retry
    } finally {
      setSending(false);
    }
  }, [text, sending, currentUser?.uid, conversationId]);

  // ── Chat bubble ─────────────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item }) => {
      const isOwn = item.senderId === currentUser?.uid;
      const time = item.createdAt?.toDate
        ? dayjs(item.createdAt.toDate()).format('h:mm A')
        : '';

      return (
        <View
          style={[
            styles.bubbleRow,
            isOwn ? styles.bubbleRowRight : styles.bubbleRowLeft,
          ]}
        >
          {!isOwn && (
            <FastImage
              style={styles.bubbleAvatar}
              source={{
                uri: otherUser?.profilePicture || DEFAULT_AVATAR,
                priority: FastImage.priority.low,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.bubbleTime,
                isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther,
              ]}
            >
              {time}
            </Text>
          </View>
        </View>
      );
    },
    [currentUser?.uid, otherUser, styles],
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () =>
      !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubble-ellipses-outline" size={56} color={theme.textSecondary} />
          <Text style={styles.emptyText}>
            No messages yet.{'\n'}Say hello! 👋
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerUser}
          onPress={() =>
            navigation.navigate('UserProfile', { userId: otherUser?.uid })
          }
          activeOpacity={0.7}
        >
          <FastImage
            style={styles.headerAvatar}
            source={{
              uri: otherUser?.profilePicture || DEFAULT_AVATAR,
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.displayName || otherUser?.username || 'User'}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ width: 24 }} />
      </View>

      {/* ── Messages ── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
      />

      {/* ── Input bar ── */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Message..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles factory ─────────────────────────────────────────────────────────────
const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    centered: { justifyContent: 'center', alignItems: 'center' },

    /* ── Header ── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    headerUser: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
    },
    headerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    headerInfo: {
      marginLeft: 10,
      flex: 1,
    },
    headerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    onlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 1,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: 4,
    },
    onlineText: {
      fontSize: 12,
      color: theme.textSecondary,
    },

    /* ── Messages list ── */
    messagesList: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexGrow: 1,
    },

    /* ── Bubble ── */
    bubbleRow: {
      flexDirection: 'row',
      marginVertical: 4,
      maxWidth: '80%',
    },
    bubbleRowLeft: {
      alignSelf: 'flex-start',
      alignItems: 'flex-end',
    },
    bubbleRowRight: {
      alignSelf: 'flex-end',
    },
    bubbleAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      marginRight: 8,
    },
    bubble: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      maxWidth: '100%',
    },
    bubbleOwn: {
      backgroundColor: theme.primary,
      borderBottomRightRadius: 4,
    },
    bubbleOther: {
      backgroundColor: theme.surface,
      borderBottomLeftRadius: 4,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 20,
    },
    bubbleTextOwn: {
      color: '#fff',
    },
    bubbleTextOther: {
      color: theme.textPrimary,
    },
    bubbleTime: {
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    bubbleTimeOwn: {
      color: 'rgba(255,255,255,0.7)',
    },
    bubbleTimeOther: {
      color: theme.textSecondary,
    },

    /* ── Empty ── */
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ scaleY: -1 }], // counteract inverted list
      paddingTop: 80,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 22,
    },

    /* ── Input bar ── */
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.textPrimary,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
  });

export default React.memo(ChatThreadScreen);
