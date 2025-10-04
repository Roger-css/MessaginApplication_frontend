import {
  AddMessageLocally,
  DeliveredMessagePayload,
  Message,
  MessageStatus,
  MessageType,
  ReadMessagePayload,
  ReceivedMessagePayload,
} from "@/src/Types/message";
import { create } from "zustand";
import { ChatService } from "../Db/ChatService";
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
  markMessagesAsRead: (props: ReadMessagePayload) => Promise<void>;
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
  setActiveConversation: (state: {
    currentChatId: string;
    isFirstTime: boolean;
  }) => void;
  removeActiveConversation: () => void;
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
      console.log("loadMessages", dbMessages);

      const messages: Message[] = dbMessages;

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
      let newUnreadCount = (currentConv?.unreadCount || 0) + 1;
      if (get().ui.currentChatId === messageData.conversationId) {
        console.log(
          "Current chat id is same as message id",
          get().ui.currentChatId
        );
        newUnreadCount = 0;
      }
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

  markMessagesAsRead: async (messages) => {
    try {
      await ChatService.markMessagesAsRead(messages);
      // Update cached conversation
      const conversationId = messages[0].conversationId;
      const state = get();
      const conversation = state.cachedConversations[conversationId];
      if (conversation) {
        await get().loadMessages(conversation.id);
        const updatedMessages =
          get().cachedConversations[conversationId].messages;
        const newMessagesRecord: Record<string, ReadMessagePayload[number]> =
          {};
        for (const message of messages) {
          newMessagesRecord[message.messageId] = message;
        }
        updatedMessages.map((message) => {
          if (message.id && newMessagesRecord[message.id] !== undefined) {
            message.status = MessageStatus.Read;
          }
          return message;
        });
        get().updateConversationCache(conversationId, {
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

  setActiveConversation: async (uiState) => {
    console.log("setting active conversation to id: ", uiState.currentChatId);
    set({ ui: uiState });
    if (!uiState.isFirstTime) {
      await ChatService.updateUnreadCount(uiState.currentChatId!, 0);
      get().updateConversationCache(uiState.currentChatId!, { unreadCount: 0 });
    }
  },
  removeActiveConversation: () => {
    console.log("removing active conversation");
    set({
      ui: {
        currentChatId: undefined,
        isFirstTime: false,
      },
    });
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
