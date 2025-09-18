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
  addConversation: (conversation: Conversation) => void;
  setActiveConversation: (state: UIState) => void;
};

// Custom storage implementation with better Map handling
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await getItemAsync(name);
      if (value === null) {
        console.log("No stored value found, returning null");
        return null;
      }

      const data = JSON.parse(value);
      console.log("Raw stored data:", data);

      // Convert conversations array back to Map
      if (data.state && data.state.conversations) {
        if (Array.isArray(data.state.conversations)) {
          // Convert array of entries back to Map
          data.state.conversations = new Map(data.state.conversations);
          console.log(
            "Converted array to Map, size:",
            data.state.conversations.size
          );
        } else if (
          typeof data.state.conversations === "object" &&
          data.state.conversations !== null
        ) {
          // Handle case where it's stored as a plain object
          const entries = Object.entries(data.state.conversations);
          data.state.conversations = new Map(entries);
          console.log(
            "Converted object to Map, size:",
            data.state.conversations.size
          );
        }
      } else {
        // Initialize with empty Map if no conversations
        data.state = data.state || {};
        data.state.conversations = new Map();
        console.log("Initialized empty Map");
      }

      return JSON.stringify(data);
    } catch (error) {
      console.error("Error in getItem:", error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      console.log(
        "Saving data, conversations type:",
        typeof data.state?.conversations
      );
      console.log("Is Map:", data.state?.conversations instanceof Map);

      // Convert Map to array for storage
      if (data.state && data.state.conversations instanceof Map) {
        const conversationsArray = Array.from(
          data.state.conversations.entries()
        );
        data.state.conversations = conversationsArray;
        console.log(
          "Converted Map to array for storage, length:",
          conversationsArray.length
        );
      }

      await setItemAsync(name, JSON.stringify(data));
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error in setItem:", error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await deleteItemAsync(name);
    } catch (error) {
      console.error("Error in removeItem:", error);
    }
  },
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

        addPendingMessage: (message) => {
          set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(message.conversationId!);

            if (!conversation) {
              throw new Error("Conversation does not exist");
            }

            const updatedConversation = {
              ...conversation,
              messages: [...conversation.messages, message],
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
            newConversations.set(conversation.id, conversation);
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
        storage: createJSONStorage(() => customStorage),
        onRehydrateStorage: () => {
          console.log("🔄 onRehydrateStorage - starting rehydration");
          return (state, error) => {
            if (error) {
              console.error("❌ Rehydration error:", error);
            } else {
              console.log("✅ onHydratedStorage - rehydration complete", {
                conversationsCount: state?.conversations?.size || 0,
                isMap: state?.conversations instanceof Map,
                conversationsType: typeof state?.conversations,
                hasUI: !!state?.ui,
              });

              // Force ensure it's a Map if it isn't
              if (state && !(state.conversations instanceof Map)) {
                console.log("🔧 Converting conversations to Map...");
                const conversations = state.conversations;
                if (Array.isArray(conversations)) {
                  console.log("🔧 conversations is an array");
                  state.conversations = new Map(conversations);
                } else if (
                  typeof conversations === "object" &&
                  conversations !== null
                ) {
                  console.log("🔧 conversations is an object");

                  state.conversations = new Map(Object.entries(conversations));
                } else {
                  console.log("delete conversations, initializing new one");
                  state.conversations = new Map();
                }
                console.log(
                  "🔧 Conversion complete, new size:",
                  state.conversations.size
                );
              }
            }
          };
        },
      }
    )
  )
);
