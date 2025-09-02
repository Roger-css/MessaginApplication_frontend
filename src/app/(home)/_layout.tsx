import SignalRWrapper from "@/src/Components/SingalRWrapper";
import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <SignalRWrapper>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
    </SignalRWrapper>
  );
}
