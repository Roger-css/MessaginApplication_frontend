import "../../tamagui-web.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import ToastManager from "toastify-react-native";
import { tamaguiConfig } from "../../tamagui.config";
import { useAuthStore } from "../Store/authStore";
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hide();
    }
  }, [isHydrated]);
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Protected guard={Boolean(refreshToken)}>
              <Stack.Screen name="(home)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!Boolean(refreshToken)}>
              <Stack.Screen name="(Auth)" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
          <ToastManager theme="dark" />
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
