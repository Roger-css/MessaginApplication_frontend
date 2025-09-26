import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { Conversation, useChatStoreDb } from "@/src/Store/chatStoreDb";
import { UserContact } from "@/src/Types/contacts";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";

export const useFetchConversations = () => {
  const { addConversation: addDbConversation, cachedConversations } =
    useChatStoreDb();
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
        const conversation: Omit<Conversation, "messages" | "participants"> = {
          id: chat.conversationId,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
          status: chat.status,
          name: chat.name,
          photoUrl: chat.photoUrl || null,
        };
        console.log("Added db conversation");
        addDbConversation(conversation);
      });
    }
  }, [, addDbConversation, chats, isLoading]);

  return {
    conversations: Object.values(cachedConversations),
    isLoading,
    refetch,
    isFetching,
  };
};
