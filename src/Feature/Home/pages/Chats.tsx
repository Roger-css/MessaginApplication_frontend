import { FlashList } from "@shopify/flash-list";
import { View } from "tamagui";
import Contact from "../components/Contact";
import MySeparator from "../components/MySeparator";
import chats from "../utils/Data";
const Chats = () => {
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
      />
    </View>
  );
};

export default Chats;
