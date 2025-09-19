import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LastMessage, UserContact } from "../Types/contacts";
import {
  AddMessageLocally,
  DeliveredMessagePayload,
  Message,
  MessageStatus,
  MessageType,
  ReceivedMessagePayload,
} from "../Types/message";
import { UserStatus } from "../Types/user";

export type Conversation = {
  id: string;
  participants: UserContact[];
  lastMessage?: LastMessage;
  messages: Message[];
  photoUrl: string | null;
  name: string;
  status: UserStatus | null;
  unreadCount: number;
};

type UIState = {
  currentChatId?: string;
  isFirstTime: boolean;
};

type ChatState = {
  conversations: Record<string, Conversation>; // Changed from Map to Record
  ui: UIState;
};

type ChatActions = {
  addPendingMessage: (message: AddMessageLocally) => void;
  receiveMessage: (message: ReceivedMessagePayload) => void;
  deliveredMessage: (props: DeliveredMessagePayload) => void;
  conversationExist: (id?: string) => boolean;
  addConversation: (
    conversation: Omit<Conversation, "messages" | "participants"> & {
      participants?: UserContact[];
    }
  ) => void;
  setActiveConversation: (state: UIState) => void;
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      conversations: {}, // Simple empty object
      ui: {
        currentChatId: undefined,
        isFirstTime: true,
      },

      addPendingMessage: (message) => {
        set((state) => {
          const conversation = state.conversations[message.conversationId!];

          if (!conversation) {
            throw new Error("Conversation does not exist");
          }

          const lastMessage: LastMessage = {
            createdAt: message.createdAt,
            text: message.text,
            senderId: message.senderId,
            senderName: undefined,
            type: message.text ? MessageType.Text : MessageType.Media,
          };

          return {
            conversations: {
              ...state.conversations,
              [message.conversationId!]: {
                ...conversation,
                messages: [...conversation.messages, message],
                lastMessage,
              },
            },
          };
        });
      },

      deliveredMessage: (messageUpdate) => {
        set((state) => {
          const conversation =
            state.conversations[messageUpdate.conversationId];

          if (!conversation) {
            console.warn(
              `Conversation ${messageUpdate.conversationId} not found`
            );
            return state;
          }

          const updatedMessages = conversation.messages.map((msg) =>
            msg.clientId === messageUpdate.clientId
              ? { ...msg, ...messageUpdate }
              : msg
          );

          return {
            conversations: {
              ...state.conversations,
              [messageUpdate.conversationId]: {
                ...conversation,
                messages: updatedMessages,
              },
            },
          };
        });
      },

      conversationExist: (id) => {
        if (!id) return false;
        return id in get().conversations;
      },

      addConversation: (conversation) => {
        set((state) => {
          const oldConversation = state.conversations[conversation.id];
          return {
            conversations: {
              ...state.conversations,
              [conversation.id]: {
                messages: oldConversation?.messages || [],
                participants: oldConversation?.participants || [],
                ...conversation,
              },
            },
          };
        });
      },

      setActiveConversation: (uiState) => {
        set({ ui: uiState });
      },

      receiveMessage: (message) => {
        set((state) => {
          const updatedMessage: Message = {
            ...message,
            status: MessageStatus.Read,
          };

          const conversation = state.conversations[message.conversationId];

          if (!conversation) {
            console.warn(`Conversation ${message.conversationId} not found`);
            return state;
          }

          return {
            conversations: {
              ...state.conversations,
              [message.conversationId]: {
                ...conversation,
                messages: [...conversation.messages, updatedMessage],
                lastMessage: {
                  text: updatedMessage.text,
                  createdAt: updatedMessage.createdAt,
                  senderId: updatedMessage.senderId,
                  type: MessageType.Text,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "conversations-storage",
      storage: createJSONStorage(() => ({
        getItem: getItemAsync,
        setItem: setItemAsync,
        removeItem: deleteItemAsync,
      })),
    }
  )
);
