import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { UserContact } from "@/src/Types/contacts";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useFetchConversations = () => {
  // const { conversations, addConversation } = useChatStore();

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

  return { chats, isLoading, refetch, isFetching };
};
