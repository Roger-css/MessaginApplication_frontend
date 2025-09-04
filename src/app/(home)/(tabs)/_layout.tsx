import { useSignalRStore } from "@/src/Store/signalRStore";
import { Tabs } from "expo-router";
import { MessageSquareText, Phone, Settings } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, View } from "tamagui";
const HomeLayout = () => {
  const connectionState = useSignalRStore().connectionState;
  return (
    <GestureHandlerRootView>
      <Tabs>
        <Tabs.Screen
          name="Index"
          options={{
            headerTitle: "",
            tabBarLabel: "Chats",
            tabBarIcon: ({ color, focused }) => (
              <MessageSquareText
                fill={focused ? color : "transparent"}
                color={color}
              />
            ),
            headerSearchBarOptions: {
              onOpen: () => {
                console.log("open");
              },
              onSubmitEditing: () => {
                console.log("search");
              },
            },
            headerLeft: (props) => {
              return (
                <View ml={"$4"}>
                  <Text>{connectionState}</Text>
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="Calls"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Phone fill={focused ? color : "transparent"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Settings fill={focused ? color : "transparent"} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};
export default HomeLayout;
