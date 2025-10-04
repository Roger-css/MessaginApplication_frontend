import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { UnInitializedContact } from "@/src/Types/contacts";
import { HeaderBackButton } from "@react-navigation/elements";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, XStack, YStack } from "tamagui";
import Contact from "../components/Contact";
import MySeparator from "../components/MySeparator";

const SearchPage = () => {
  const insets = useSafeAreaInsets();
  const axios = useAxiosAuth();
  const [search, setSearch] = useState("");
  const { data } = useQuery<UnInitializedContact[]>({
    queryKey: ["search", search],
    queryFn: async () => {
      if (search === "") return [];
      const res = await axios.get(`/Contacts/search/${search}`);
      return res.data;
    },
    initialData: [],
  });

  return (
    <YStack pb={insets.bottom} bg={"$black2"} flex={1}>
      <GestureHandlerRootView>
        <XStack
          p="$3"
          pt={insets.top + 10}
          items="center"
          justify="flex-start"
          bg="$shadow3"
          gap="$2"
        >
          <HeaderBackButton onPress={router.back} tintColor="white" />
          <Input
            autoFocus
            flex={1}
            placeholder="Search..."
            py="$0"
            value={search}
            onChange={(e) => setSearch(e.nativeEvent.text)}
          />
        </XStack>
        <YStack flex={1}>
          <FlashList
            renderItem={({ item }) => {
              return <Contact props={item} url={item.userId} firstTime />;
            }}
            keyExtractor={(e) => e.userId}
            data={data}
            estimatedItemSize={134}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={MySeparator}
          />
        </YStack>
      </GestureHandlerRootView>
    </YStack>
  );
};

export default SearchPage;
