import { useAuthStore } from "@/src/Store/authStore";
import { Button, Text, YStack } from "tamagui";

export default function Index() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <YStack
      gap={"$6"}
      height={"100%"}
      bg={"$black4"}
      justify={"center"}
      items={"center"}
    >
      <Text>home</Text>
      <Button bg={"$red6"} onPress={logout}>
        Log Out
      </Button>
    </YStack>
  );
}
