import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { UserContact } from "@/src/Types/contacts";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { View } from "tamagui";
import Contact from "../components/Contact";
import EmptyPage from "../components/EmptyPage";
import MySeparator from "../components/MySeparator";
const Chats = () => {
  const axios = useAxiosAuth();
  const id = useGetCurrentUserId();
  const {
    data: chats,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<UserContact[], AxiosError>({
    queryKey: ["userContacts", id],
    queryFn: async () => (await axios.get(`/contacts/${id}`)).data,
    refetchOnReconnect: true,
    retry: 1,
  });
  return (
    <View height={"100%"} bg={"$black3"}>
      <FlashList
        renderItem={({ item }) => {
          return <Contact props={item} url={item.conversationId} />;
        }}
        keyExtractor={(e) => e.name}
        data={chats}
        estimatedItemSize={134}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={MySeparator}
        ListEmptyComponent={<EmptyPage isLoading={isLoading} />}
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </View>
  );
};

export default Chats;
