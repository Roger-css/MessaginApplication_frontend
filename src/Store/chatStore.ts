import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { LastMessage, UserContact } from "../Types/contacts";
import { ReceivedMessagePayload as Message } from "../Types/message";
type Conversation = {
  id: string;
  participants: UserContact[];
  lastMessage: LastMessage;
  messages: Message[];
  unreadCount: number;
};
type ChatState = {
  conversations: Conversation[];
};

type ChatActions = {
  addMessage: (message: Message) => void;
  conversationExist: (id?: string) => boolean;
  addConversation: (conversation: Conversation) => void;
};

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    persist(
      (set, get) => ({
        conversations: [],
        addMessage: (message) => {
          const conversationsArray = get().conversations;
          const conversationIndex = conversationsArray.findIndex(
            (e) => e.id === message.conversationId
          );
          if (!conversationIndex) {
            throw new Error("Conversation does not exist");
          }
          conversationsArray[conversationIndex].messages.push(message);
          set({ conversations: conversationsArray });
        },
        conversationExist: (id) => {
          if (!id) return false;
          const conversationsArray = get().conversations;
          const conversationIndex = conversationsArray.findIndex(
            (e) => e.id === id
          );
          return conversationIndex > -1;
        },
        addConversation: (conversation) => {
          const conversationsArray = get().conversations;
          conversationsArray.push(conversation);
          set({ conversations: conversationsArray });
        },
      }),
      {
        name: "conversations-storage",
        storage: createJSONStorage(() => ({
          getItem,
          removeItem: deleteItemAsync,
          setItem,
        })),
      }
    )
  )
);
