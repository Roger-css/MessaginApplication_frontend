import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { LastMessage, UserContact } from "../Types/contacts";
import {
  AddMessageLocally,
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

type UpdateMessage = {
  messageId: string;
  conversationId: string;
  status: MessageStatus;
};

type ChatState = {
  conversations: Map<string, Conversation>;
  ui: UIState;
};

type ChatActions = {
  addPendingMessage: (message: AddMessageLocally) => void;
  receiveMessage: (message: ReceivedMessagePayload) => void;
  updateMessage: (props: UpdateMessage) => void;
  conversationExist: (id?: string) => boolean;
  addConversation: (
    conversation: Omit<Conversation, "messages" | "participants"> & {
      participants?: UserContact[];
    }
  ) => void;
  setActiveConversation: (state: UIState) => void;
  hydrate: () => void;
};

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    persist(
      (set, get) => ({
        conversations: new Map<string, Conversation>(),
        ui: {
          currentChatId: undefined,
          isFirstTime: true,
        },
        hydrate: () => {
          console.log("onHydration: ", get().conversations);

          set((state) => {
            return {
              conversations: new Map<string, Conversation>(
                Object.entries(state.conversations)
              ),
            };
          });
        },
        addPendingMessage: (message) => {
          set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(message.conversationId!);

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
            const updatedConversation: Conversation = {
              ...conversation,
              messages: [...conversation.messages, message],
              lastMessage,
            };

            newConversations.set(message.conversationId!, updatedConversation);

            return {
              conversations: newConversations,
            };
          });
        },

        updateMessage: (messageUpdate) => {
          set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(
              messageUpdate.conversationId
            );

            if (!conversation) {
              console.warn(
                `Conversation ${messageUpdate.conversationId} not found`
              );
              return state; // Return unchanged state
            }

            // Find and update the message
            const updatedMessages = conversation.messages.map((msg) =>
              msg.id === messageUpdate.messageId
                ? { ...msg, status: messageUpdate.status }
                : msg
            );

            const updatedConversation = {
              ...conversation,
              messages: updatedMessages,
            };

            newConversations.set(
              messageUpdate.conversationId,
              updatedConversation
            );

            return {
              conversations: newConversations,
            };
          });
        },

        conversationExist: (id) => {
          if (!id) return false;
          return get().conversations.has(id);
        },

        addConversation: (conversation) => {
          set((state) => {
            const newConversations = new Map(state.conversations);
            const oldConversation = newConversations.get(conversation.id);
            newConversations.set(conversation.id, {
              messages: oldConversation?.messages || [],
              participants: oldConversation?.participants || [],
              ...conversation,
            });
            return {
              conversations: newConversations,
            };
          });
        },

        setActiveConversation: (state) => {
          set({ ui: state });
        },

        receiveMessage: (message) => {
          set((state) => {
            const updatedMessage: Message = {
              ...message,
              status: MessageStatus.Read,
            };

            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(message.conversationId);

            if (!conversation) {
              console.warn(`Conversation ${message.conversationId} not found`);
              return state; // Return unchanged state
            }

            const updatedConversation: Conversation = {
              ...conversation,
              messages: [...conversation.messages, updatedMessage],
              lastMessage: {
                text: updatedMessage.text,
                createdAt: updatedMessage.createdAt,
                senderId: updatedMessage.senderId,
                type: MessageType.Text,
              },
              //unreadCount: conversation.unreadCount + 1,
            };
            newConversations.set(message.conversationId, updatedConversation);
            return {
              conversations: newConversations,
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
  )
);
