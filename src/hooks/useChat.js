/**
 * useChat.js
 * ---------
 * Custom React hook that manages direct messaging subscriptions.
 * Subscribes to the current user's list of conversations in real-time,
 * and sets up a secondary subscription for active conversation threads when loaded.
 *
 * Synchronises data directly with the Redux `chat` slice.
 *
 * @module hooks/useChat
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import chatService from '../services/chatService';
import { setConversations, setMessages } from '../store/slices/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages, activeConversation, loading } = useSelector((state) => state.chat);

  // 1. Subscribe to conversation list changes
  useEffect(() => {
    if (!user) return;

    // Listen to all conversations where the user participates
    const unsubscribe = chatService.subscribeToConversations(user.uid, (updatedConversations) => {
      dispatch(setConversations(updatedConversations));
    });

    return () => unsubscribe(); // unsubscribe on unmount
  }, [user, dispatch]);

  // 2. Subscribe to active conversation message stream
  useEffect(() => {
    if (!activeConversation) {
      dispatch(setMessages([]));
      return;
    }

    // Listen to messages within the active conversation
    const unsubscribe = chatService.subscribeToMessages(activeConversation, (updatedMessages) => {
      dispatch(setMessages(updatedMessages));
    });

    return () => unsubscribe(); // unsubscribe on unmount
  }, [activeConversation, dispatch]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
  };
};

export default useChat;
