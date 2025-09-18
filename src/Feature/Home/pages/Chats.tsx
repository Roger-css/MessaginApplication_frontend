import { FlashList } from "@shopify/flash-list";
import { View } from "tamagui";
import Contact from "../components/Contact";
import EmptyPage from "../components/EmptyPage";
import MySeparator from "../components/MySeparator";
import { useFetchConversations } from "../hooks/useFetchConversations";
const Chats = () => {
  const { chats, isFetching, isLoading, refetch } = useFetchConversations();
  return (
    <View height={"100%"} bg={"$black3"}>
      <FlashList
        renderItem={({ item }) => {
          return (
            <Contact props={item} url={item.conversationId} firstTime={false} />
          );
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
