/**
 * Chat Slice
 *
 * Manages direct-messaging state: conversation list, messages for the
 * active conversation, and the currently-viewed conversation reference.
 * Real-time updates from onSnapshot are dispatched via the synchronous
 * reducers (setConversations, setMessages, addMessage) from the useChat hook.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// ──────────────────────────── Initial State ────────────────────────────

const initialState = {
  /** List of conversation objects (sorted by lastMessageAt) */
  conversations: [],
  /** Messages for the currently active conversation */
  messages: [],
  /** ID or reference of the conversation currently being viewed */
  activeConversation: null,
  /** Loading flag */
  loading: false,
  /** Last error message */
  error: null,
};

// ──────────────────────────── Async Thunks ─────────────────────────────

/**
 * fetchConversations — load all conversations the current user participates in.
 * @param {string} userId
 */
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (userId, { rejectWithValue }) => {
    try {
      const conversations = await chatService.getConversations(userId);
      return conversations;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch conversations.',
      );
    }
  },
);

/**
 * fetchMessages — load messages for a specific conversation.
 * @param {Object} params - { conversationId, limit? }
 */
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, limit = 50 }, { rejectWithValue }) => {
    try {
      const messages = await chatService.getMessages(conversationId, limit);
      return messages;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch messages.',
      );
    }
  },
);

/**
 * sendMessage — send a text message in the active conversation.
 * @param {Object} params - { conversationId, senderId, senderName, senderAvatar, text }
 */
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { conversationId, senderId, senderName, senderAvatar, text },
    { rejectWithValue },
  ) => {
    try {
      const message = await chatService.sendMessage({
        conversationId,
        senderId,
        senderName,
        senderAvatar,
        text,
      });
      return message;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to send message.',
      );
    }
  },
);

/**
 * createConversation — start a new DM thread between two users.
 * @param {Object} params - { participants: [userId1, userId2], participantDetails }
 */
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participants, participantDetails }, { rejectWithValue }) => {
    try {
      const conversation = await chatService.createConversation(
        participants,
        participantDetails,
      );
      return conversation;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to create conversation.',
      );
    }
  },
);

// ──────────────────────────── Slice ────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * setConversations — replace the full conversation list.
     * Called from the useChat hook on snapshot updates.
     */
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    /**
     * setMessages — replace the messages array for the active conversation.
     * Called from the useChat hook when the message listener fires.
     */
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    /**
     * addMessage — append a single message to the active conversation.
     * Useful for optimistic updates before the snapshot catches up.
     */
    addMessage: (state, action) => {
      // Avoid duplicates by checking the message ID
      const exists = state.messages.some((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },

    /**
     * setActiveConversation — set the conversation currently being viewed.
     * Pass null when leaving the chat screen.
     */
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // Clear messages when switching conversations to avoid showing stale data
      if (action.payload === null) {
        state.messages = [];
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchConversations ──
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchMessages ──
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── sendMessage ──
    builder
      .addCase(sendMessage.pending, (state) => {
        // Don't set global loading for message sends — it would
        // flash a spinner on every keystroke / send tap.
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const exists = state.messages.some((m) => m.id === action.payload.id);
        if (!exists) {
          state.messages.push(action.payload);
        }
        // Update the lastMessage preview in the conversation list
        const convIdx = state.conversations.findIndex(
          (c) => c.id === action.payload.conversationId,
        );
        if (convIdx !== -1) {
          state.conversations[convIdx] = {
            ...state.conversations[convIdx],
            lastMessage: action.payload.text,
            lastMessageAt: action.payload.createdAt,
          };
        }
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── createConversation ──
    builder
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        // Prepend the new conversation and set it as active
        state.conversations = [action.payload, ...state.conversations];
        state.activeConversation = action.payload.id;
        state.loading = false;
        state.error = null;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setConversations,
  setMessages,
  addMessage,
  setActiveConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
