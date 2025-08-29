import { Tabs } from "expo-router";
import { MessageSquareText, Phone, Settings } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const HomeLayout = () => {
  return (
    <GestureHandlerRootView>
      <Tabs>
        <Tabs.Screen
          name="Index"
          options={{
            headerTitle: "Chats",
            tabBarLabel: "Chats",
            tabBarIcon: ({ color, focused }) => (
              <MessageSquareText
                fill={focused ? color : "transparent"}
                color={color}
              />
            ),
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
