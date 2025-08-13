import "../../tamagui-web.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import ToastManager from "toastify-react-native";
import { tamaguiConfig } from "../../tamagui.config";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(Auth)" options={{ headerShown: false }} />
          </Stack>
          <ToastManager theme="dark" />
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
