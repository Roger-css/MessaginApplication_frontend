import {
  AddMessageLocally,
  DeliveredMessagePayload,
  Message,
  MessageStatus,
  MessageType,
  ReceivedMessagePayload,
} from "@/src/Types/message";
import { and, desc, eq, sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import { ChatService, db } from "../Db/ChatService";
import { conversations, messages } from "../Db/Schema/V1";
import { LastMessage } from "../Types/contacts";
import { UserInfo, UserStatus } from "../Types/user";

// Types for store operations

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: LastMessage;
  messages: Message[];
  photoUrl: string | null;
  name: string;
  status: UserStatus;
  unreadCount: number;
};

type UIState = {
  currentChatId?: string;
  isFirstTime: boolean;
};

type ChatState = {
  // In-memory cache for quick access
  cachedConversations: Record<string, Conversation>;
  cachedUsers: Record<string, UserInfo>;
  ui: UIState;
  isLoading: boolean;
};

type ChatActions = {
  // Message operations
  addPendingMessage: (message: AddMessageLocally) => Promise<void>;
  receiveMessage: (message: ReceivedMessagePayload) => Promise<void>;
  deliveredMessage: (props: DeliveredMessagePayload) => Promise<void>;
  deliveredMessageToOtherParty: (
    props: DeliveredMessagePayload
  ) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  searchMessages: (
    query: string,
    conversationId?: string
  ) => Promise<Message[]>;

  // Conversation operations
  conversationExist: (id?: string) => boolean;
  addConversation: (
    conversation: Omit<Conversation, "messages" | "participants">
  ) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (
    conversationId: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;

  // UI operations
  setActiveConversation: (state: UIState) => void;

  // User operations
  updateUser: (user: UserInfo) => Promise<void>;
  getUser: (userId: string) => Promise<UserInfo | null>;

  // Cache management
  updateConversationCache: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;
  updateUserCache: (userId: string, user: UserInfo) => void;
  refreshConversation: (conversationId: string) => Promise<void>;

  // Utility
  clearAllData: () => Promise<void>;
};

export const useChatStoreDb = create<ChatState & ChatActions>()((set, get) => ({
  cachedConversations: {},
  cachedUsers: {},
  ui: {
    currentChatId: undefined,
    isFirstTime: true,
  },
  isLoading: false,

  loadConversations: async () => {
    try {
      set({ isLoading: true });
      const dbConversations = await ChatService.getConversations();

      const conversations: Record<string, Conversation> = {};
      const users: Record<string, UserInfo> = {};

      for (const conv of dbConversations) {
        conversations[conv.id] = conv;
      }
      // TODO: Get users
      set({
        cachedConversations: conversations,
        cachedUsers: users,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadMessages: async (conversationId: string, limit = 50, offset = 0) => {
    try {
      const dbMessages = await ChatService.getMessages(
        conversationId,
        limit,
        offset
      );
      const messages: Message[] = dbMessages.reverse(); // Reverse to show chronological order

      set((state) => {
        const conversation = state.cachedConversations[conversationId];
        if (!conversation) return state;

        return {
          cachedConversations: {
            ...state.cachedConversations,
            [conversationId]: {
              ...conversation,
              messages:
                offset === 0
                  ? messages
                  : [...messages, ...conversation.messages],
            },
          },
        };
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      throw error;
    }
  },

  addPendingMessage: async (messageData) => {
    try {
      const message: Message = {
        ...messageData,
        status: MessageStatus.Pending,
      };

      // Add to database
      await ChatService.addMessage(message);

      // Update cached conversation
      const state = get();
      const conversation =
        state.cachedConversations[messageData.conversationId];
      if (conversation) {
        const sender = state.cachedUsers[messageData.senderId];
        const lastMessage: LastMessage = {
          text: messageData.text,
          senderId: messageData.senderId,
          senderName: sender?.name,
          type:
            messageData.media && messageData.media.length > 0
              ? MessageType.Media
              : MessageType.Text,
          createdAt: messageData.createdAt,
        };

        get().updateConversationCache(messageData.conversationId, {
          messages: [...conversation.messages, message],
          lastMessage,
        });
      }
    } catch (error) {
      console.error("Failed to add pending message:", error);
      throw error;
    }
  },

  deliveredMessageToOtherParty: async (messageUpdate) => {
    try {
      const message = { ...messageUpdate, status: MessageStatus.Delivered };
      if (messageUpdate.clientId) {
        await ChatService.updateMessage(messageUpdate.clientId, {
          status: MessageStatus.Delivered,
        });
      }
      // Update cached conversation
      const state = get();
      const conversation =
        state.cachedConversations[messageUpdate.conversationId];
      if (conversation) {
        const updatedMessages = conversation.messages.map((msg) =>
          msg.clientId === message.clientId
            ? { ...msg, status: MessageStatus.Delivered }
            : msg
        );
        get().updateConversationCache(messageUpdate.conversationId, {
          messages: updatedMessages,
        });
      }
    } catch (error) {
      console.error("Failed to update delivered message:", error);
      throw error;
    }
  },
  deliveredMessage: async (messageUpdate) => {
    try {
      const message = { ...messageUpdate, status: MessageStatus.Sent };
      if (messageUpdate.clientId) {
        await ChatService.updateMessage(messageUpdate.clientId, {
          id: messageUpdate.messageId,
          status: MessageStatus.Sent,
          createdAt: messageUpdate.createdAt,
        });
      }
      // Update cached conversation
      const state = get();
      const conversation =
        state.cachedConversations[messageUpdate.conversationId];
      if (conversation) {
        const updatedMessages = conversation.messages.map((msg) =>
          msg.clientId === message.clientId ? { ...msg, ...message } : msg
        );
        get().updateConversationCache(messageUpdate.conversationId, {
          messages: updatedMessages,
        });
      }
    } catch (error) {
      console.error("Failed to update delivered message:", error);
      throw error;
    }
  },
  receiveMessage: async (messageData) => {
    try {
      const message: Message = {
        id: messageData.id,
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        text: messageData.text,
        media: messageData.media,
        replyToMessageId: messageData.replyToMessageId,
        status: MessageStatus.Delivered,
        clientId: messageData.id!,
        createdAt: messageData.createdAt,
      };

      // Add to database
      await ChatService.addMessage(message);

      // Update unread count
      const state = get();
      const currentConv = state.cachedConversations[messageData.conversationId];
      const newUnreadCount = (currentConv?.unreadCount || 0) + 1;
      await ChatService.updateUnreadCount(
        messageData.conversationId,
        newUnreadCount
      );

      // Update cached conversation
      if (currentConv) {
        const lastMessage: LastMessage = {
          text: messageData.text,
          senderId: messageData.senderId,
          type:
            messageData.media && messageData.media.length > 0
              ? MessageType.Media
              : MessageType.Text,
          createdAt: messageData.createdAt,
        };

        get().updateConversationCache(messageData.conversationId, {
          messages: [...currentConv.messages, message],
          unreadCount: newUnreadCount,
          lastMessage,
        });
      } else {
        // Conversation not in cache, refresh it
        await get().refreshConversation(messageData.conversationId);
      }
    } catch (error) {
      console.error("Failed to receive message:", error);
      throw error;
    }
  },

  markMessagesAsRead: async (conversationId: string) => {
    try {
      await ChatService.markMessagesAsRead(conversationId);
      // Update cached conversation
      const state = get();
      const conversation = state.cachedConversations[conversationId];
      if (conversation) {
        const updatedMessages = conversation.messages.map((msg) => ({
          ...msg,
          status:
            msg.status === MessageStatus.Delivered
              ? MessageStatus.Read
              : msg.status,
        }));

        get().updateConversationCache(conversationId, {
          unreadCount: 0,
          messages: updatedMessages,
        });
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      throw error;
    }
  },

  searchMessages: async (query: string, conversationId?: string) => {
    try {
      return await ChatService.searchMessages(query, conversationId);
    } catch (error) {
      console.error("Failed to search messages:", error);
      throw error;
    }
  },

  conversationExist: (id) => {
    if (!id) return false;
    return id in get().cachedConversations;
  },

  addConversation: async (conversation) => {
    try {
      // Add conversation to database
      await ChatService.upsertConversation({
        id: conversation.id,
        photoUrl: conversation.photoUrl,
        name: conversation.name,
        status: conversation.status,
        unreadCount: conversation.unreadCount,
        participants: [],
      });

      // Update cached conversation
      get().updateConversationCache(conversation.id, {
        ...conversation,
        messages: [],
        participants: [],
      });
    } catch (error) {
      console.error("Failed to add conversation:", error);
      throw error;
    }
  },

  updateUser: async (user) => {
    try {
      await ChatService.upsertUser(user);
      get().updateUserCache(user.id, user);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  getUser: async (userId: string) => {
    try {
      // Check cache first
      const state = get();
      const cachedUser = state.cachedUsers[userId];
      if (cachedUser) return cachedUser;

      // Fetch from database
      const user = await ChatService.getUser(userId);
      if (user) {
        get().updateUserCache(userId, user);
      }
      return user;
    } catch (error) {
      console.error("Failed to get user:", error);
      throw error;
    }
  },

  updateConversationCache: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => {
    set((state) => ({
      cachedConversations: {
        ...state.cachedConversations,
        [conversationId]: {
          ...state.cachedConversations[conversationId],
          ...updates,
        },
      },
    }));
  },

  updateUserCache: (userId: string, user: UserInfo) => {
    set((state) => ({
      cachedUsers: {
        ...state.cachedUsers,
        [userId]: user,
      },
    }));
  },

  refreshConversation: async (conversationId: string) => {
    try {
      const conversation = await ChatService.getConversation(conversationId);
      if (conversation) {
        // Update conversation cache
        get().updateConversationCache(conversationId, conversation);
      }
    } catch (error) {
      console.error("Failed to refresh conversation:", error);
      throw error;
    }
  },

  setActiveConversation: (uiState) => {
    set({ ui: uiState });

    // Mark messages as read when opening a conversation
    if (uiState.currentChatId) {
      const state = get();
      const conversation = state.cachedConversations[uiState.currentChatId];
      if (conversation && conversation.unreadCount > 0) {
        // You'll need to pass the current user ID here
        get().markMessagesAsRead(uiState.currentChatId);
      }
    }
  },

  clearAllData: async () => {
    try {
      await ChatService.clearAllData();
      set({
        cachedConversations: {},
        cachedUsers: {},
        ui: {
          currentChatId: undefined,
          isFirstTime: true,
        },
      });
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  },
}));

// Hook for getting conversations with live updates (use sparingly)
export const useConversationsLive = () => {
  if (db === null) throw new Error("db not initialized");

  const latestMessages = db
    .select({
      conversationId: messages.conversationId,
      latestId: sql<string>`max(${messages.createdAt})`.as("latest_createdAt"),
    })
    .from(messages)
    .groupBy(messages.conversationId)
    .as("latest_messages");

  // 2. Join conversations with the latest messages
  const result = db
    .select({
      conversation: conversations,
      lastMessage: messages,
    })
    .from(conversations)
    .innerJoin(
      latestMessages,
      eq(conversations.id, latestMessages.conversationId)
    )
    .innerJoin(
      messages,
      and(
        eq(messages.conversationId, latestMessages.conversationId),
        eq(messages.createdAt, latestMessages.latestId)
      )
    )
    .orderBy(desc(messages.createdAt));
  const { data: conversationsData, error } = useLiveQuery(result);

  return {
    conversations: conversationsData || [],
    isLoading: !conversationsData && !error,
    error,
  };
};

// Main hook for app-wide chat operations
export const useChat = () => {
  const store = useChatStoreDb();

  const sendMessage = async (message: AddMessageLocally) => {
    try {
      await store.addPendingMessage(message);
      // Here you would typically also send the message to your server
      // Example: await chatAPI.sendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const createConversation = async (conversationData: Conversation) => {
    try {
      await store.addConversation(conversationData);
      // Here you would typically also create the conversation on your server
      // Example: await chatAPI.createConversation(conversationData);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  };

  const openConversation = async (conversationId: string) => {
    try {
      store.setActiveConversation({
        currentChatId: conversationId,
        isFirstTime: false,
      });

      // Load conversation if not in cache
      if (!store.cachedConversations[conversationId]) {
        await store.refreshConversation(conversationId);
      }

      // Load messages if not already loaded
      const conversation = store.cachedConversations[conversationId];
      if (conversation && conversation.messages.length === 0) {
        await store.loadMessages(conversationId);
      }
    } catch (error) {
      console.error(`Failed to open conversation ${conversationId}:`, error);
      throw error;
    }
  };

  const initializeChat = async () => {
    try {
      await store.loadConversations();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      throw error;
    }
  };

  return {
    // State
    conversations: store.cachedConversations,
    users: store.cachedUsers,
    currentChatId: store.ui.currentChatId,
    isFirstTime: store.ui.isFirstTime,
    isLoading: store.isLoading,

    // Actions
    sendMessage,
    createConversation,
    openConversation,
    initializeChat,

    // Direct store actions
    receiveMessage: store.receiveMessage,
    deliveredMessage: store.deliveredMessage,
    updateUser: store.updateUser,
    markMessagesAsRead: store.markMessagesAsRead,
    clearAllData: store.clearAllData,
    searchMessages: store.searchMessages,
    loadConversations: store.loadConversations,

    // Utilities
    conversationExist: store.conversationExist,
    getUser: store.getUser,
  };
};
