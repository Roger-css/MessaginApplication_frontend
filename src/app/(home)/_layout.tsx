import { Tabs } from "expo-router";
import { MessageSquareText, Phone, Settings } from "lucide-react-native";
export default function HomeLayout() {
  return (
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
  );
}
