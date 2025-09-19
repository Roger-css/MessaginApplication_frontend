import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { Conversation, useChatStore } from "@/src/Store/chatStore";
import { UserContact } from "@/src/Types/contacts";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";

export const useFetchConversations = () => {
  const { conversations, addConversation } = useChatStore();

  const axios = useAxiosAuth();
  const id = useGetCurrentUserId();
  const {
    data: chats,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<UserContact[], AxiosError>({
    queryKey: ["userContacts", id],
    queryFn: async () => (await axios.get(`/contacts/getAll/${id}`)).data,
    refetchOnReconnect: true,
    retry: 1,
  });
  useEffect(() => {
    if (!isLoading) {
      chats?.forEach((chat) => {
        const conversation: Omit<Conversation, "messages"> = {
          id: chat.conversationId,
          lastMessage: chat.lastMessage,
          participants: [],
          unreadCount: chat.unreadCount,
          status: chat.status,
          name: chat.name,
          photoUrl: chat.photoUrl || null,
        };
        addConversation(conversation);
      });
    }
  }, [addConversation, chats, isLoading]);

  return {
    conversations: Array.from(conversations.values()),
    isLoading,
    refetch,
    isFetching,
  };
};
