import { useSignalRWrapper } from "@/src/Components/SingalRWrapper";
import { Stack } from "expo-router";

export default function HomeLayout() {
  useSignalRWrapper();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/index" options={{ headerShown: false }} />
      <Stack.Screen name="Search" options={{ headerShown: false }} />
    </Stack>
  );
}
