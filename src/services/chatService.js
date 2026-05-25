/**
 * chatService.js
 *
 * Chat / direct-messaging service for Social Connect app.
 * Manages conversations and their messages subcollections,
 * including creation, fetching, sending, and real-time
 * subscriptions via @react-native-firebase/firestore.
 */

import firestore from '@react-native-firebase/firestore';

/**
 * Create a new conversation between two users, or return the
 * existing one if they already have a conversation.
 *
 * The `participants` array is stored in sorted order so the
 * same pair always maps to the same document query.
 *
 * @param {string} userId1 - UID of the first participant.
 * @param {string} userId2 - UID of the second participant.
 * @returns {Promise<Object>} The conversation object (id + data).
 * @throws {Error} If creation / lookup fails.
 */
export const createConversation = async (userId1, userId2) => {
  try {
    // Always sort so the query is deterministic
    const participants = [userId1, userId2].sort();

    // Check for an existing conversation with exactly these two participants
    const existingSnapshot = await firestore()
      .collection('conversations')
      .where('participants', '==', participants)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const doc = existingSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    // No existing conversation — create a new one
    const conversationRef = await firestore().collection('conversations').add({
      participants,
      lastMessage: '',
      lastMessageTime: firestore.FieldValue.serverTimestamp(),
      lastMessageSenderId: '',
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    const newDoc = await conversationRef.get();
    return { id: newDoc.id, ...newDoc.data() };
  } catch (error) {
    throw new Error(error.message || 'Failed to create or find conversation.');
  }
};

/**
 * Fetch all conversations that include the given user,
 * ordered by the most recently active first.
 *
 * @param {string} userId - UID of the current user.
 * @returns {Promise<Object[]>} Array of conversation objects.
 * @throws {Error} If fetching conversations fails.
 */
export const getConversations = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTime', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch conversations.');
  }
};

/**
 * Send a text message within a conversation.
 * Adds a document to the messages subcollection and
 * updates the parent conversation's lastMessage metadata.
 *
 * @param {string} conversationId - The Firestore doc ID of the conversation.
 * @param {string} senderId - UID of the message sender.
 * @param {string} text - The message body.
 * @returns {Promise<import('@react-native-firebase/firestore').FirebaseFirestoreTypes.DocumentReference>}
 *   The DocumentReference of the newly created message.
 * @throws {Error} If sending the message fails.
 */
export const sendMessage = async (conversationId, senderId, text) => {
  try {
    const conversationRef = firestore().collection('conversations').doc(conversationId);

    // Verify the conversation exists
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
      throw new Error('Conversation not found.');
    }

    // Add the message to the subcollection
    const messageRef = await conversationRef.collection('messages').add({
      senderId,
      text,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Determine the recipient and increment their unread counter
    const conversationData = conversationDoc.data();
    const recipientId = conversationData.participants.find((id) => id !== senderId);

    await conversationRef.update({
      lastMessage: text,
      lastMessageTime: firestore.FieldValue.serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount.${recipientId}`]: firestore.FieldValue.increment(1),
    });

    return messageRef;
  } catch (error) {
    throw new Error(error.message || 'Failed to send message.');
  }
};

/**
 * Fetch all messages in a conversation, ordered oldest-first.
 *
 * @param {string} conversationId - The Firestore doc ID of the conversation.
 * @returns {Promise<Object[]>} Array of message objects.
 * @throws {Error} If fetching messages fails.
 */
export const getMessages = async (conversationId) => {
  try {
    const snapshot = await firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch messages.');
  }
};

/**
 * Subscribe to real-time updates for all conversations
 * the given user is a participant in.
 *
 * @param {string} userId - UID of the current user.
 * @param {function(Object[]): void} callback - Called with the updated conversations array.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const subscribeToConversations = (userId, callback) => {
  const unsubscribe = firestore()
    .collection('conversations')
    .where('participants', 'array-contains', userId)
    .orderBy('lastMessageTime', 'desc')
    .onSnapshot(
      (snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(conversations);
      },
      (error) => {
        console.error('[chatService] subscribeToConversations error:', error);
        callback([]);
      },
    );

  return unsubscribe;
};

/**
 * Subscribe to real-time updates for messages within a single conversation.
 *
 * @param {string} conversationId - The Firestore doc ID of the conversation.
 * @param {function(Object[]): void} callback - Called with the updated messages array.
 * @returns {function} Unsubscribe function — call it to stop listening.
 */
export const subscribeToMessages = (conversationId, callback) => {
  const unsubscribe = firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      },
      (error) => {
        console.error('[chatService] subscribeToMessages error:', error);
        callback([]);
      },
    );

  return unsubscribe;
};

export default {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  subscribeToConversations,
  subscribeToMessages,
};
