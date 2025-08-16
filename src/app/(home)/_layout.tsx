import { tamaguiConfig } from "@/tamagui.config";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="Completed"
        options={{
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: tamaguiConfig.themes.dark.blue2.val,
          },
          headerBackVisible: false,
        }}
      />
      {/* <Stack.Screen
          name="Completed"
          options={{
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: tamaguiConfig.themes.dark.blue2.val,
            },
            headerBackVisible: false,
          }}
        /> */}
    </Stack>
  );
}
