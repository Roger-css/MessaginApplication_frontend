import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { UserContact } from "@/src/Types/Contacts";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Text, View } from "tamagui";
import Contact from "../components/Contact";
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
    queryFn: async () => (await axios.post("/contacts", { id: id })).data,
    refetchOnReconnect: true,
    retry: 1,
  });
  return (
    <View height={"100%"} bg={"$black3"}>
      <FlashList
        renderItem={(item) => {
          return <Contact props={item.item} />;
        }}
        keyExtractor={(e) => e.name}
        data={chats}
        estimatedItemSize={134}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={MySeparator}
        ListEmptyComponent={<Loader isLoading={isLoading} />}
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </View>
  );
};
const Loader = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <View flex={1} justify={"center"} items="center" height={"100%"}>
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && <Text>You have no one :(</Text>}
    </View>
  );
};
export default Chats;
