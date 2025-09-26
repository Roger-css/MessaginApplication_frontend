import DatabaseSetup from "@/src/Components/DataBaseSetup";
import GeneralLoader from "@/src/Components/GeneralLoader";
import { useSignalRWrapper } from "@/src/Components/SingalRWrapper";
import { DBName } from "@/src/Db/Constants";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
export default function HomeLayout() {
  useSignalRWrapper();
  return (
    <Suspense fallback={<GeneralLoader />}>
      <SQLiteProvider
        databaseName={DBName}
        useSuspense
        options={{ enableChangeListener: true }}
      >
        <DatabaseSetup>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/index" options={{ headerShown: false }} />
            <Stack.Screen name="Search" options={{ headerShown: false }} />
          </Stack>
        </DatabaseSetup>
      </SQLiteProvider>
    </Suspense>
  );
}
