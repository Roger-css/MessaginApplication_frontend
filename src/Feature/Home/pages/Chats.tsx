import { FlashList } from "@shopify/flash-list";
import { Text, View } from "tamagui";
import Contact from "../components/Contact";
import chats from "../utils/Data";
const Chats = () => {
  return (
    <View height={"100%"}>
      <Text style={{ color: "white" }}>Contacts</Text>
      <FlashList
        renderItem={(item) => {
          return <Contact key={item.item.name} props={item.item} />;
        }}
        data={chats}
        estimatedItemSize={134}
      />
    </View>
  );
};

export default Chats;
