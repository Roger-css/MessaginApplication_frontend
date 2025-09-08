import { useSignalRStore } from "@/src/Store/signalRStore";
import { router, Tabs } from "expo-router";
import {
  MessageSquareText,
  Phone,
  Search,
  Settings,
} from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Text, View } from "tamagui";
const HomeLayout = () => {
  const connectionState = useSignalRStore().connectionState;
  return (
    <GestureHandlerRootView>
      <Tabs screenOptions={{ tabBarActiveTintColor: "green" }}>
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
            headerRight: () => (
              <Button bg={"transparent"} onPress={() => router.push("/Search")}>
                <Search size={24} color={"white"} />
              </Button>
            ),
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
