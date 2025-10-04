import migrations from "@/drizzle/migrations";
import { useChatStoreDb } from "@/src/Store/chatStoreDb";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";
import { ReactNode, useEffect } from "react";
import { setDbConnection } from "../Db/ChatService";
import GeneralLoader from "./GeneralLoader";

const DatabaseSetup = ({ children }: { children: ReactNode }) => {
  const { loadConversations } = useChatStoreDb((state) => state);
  const expoDb = useSQLiteContext();
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);
  if (success) console.log("Migrations were successful: ");
  if (!success) console.log("Migrations failed: ", error);
  useDrizzleStudio(expoDb);
  setDbConnection(db);
  useEffect(() => {
    const Load = async () => {
      try {
        await loadConversations();
      } catch (error) {
        console.log("error from loading conversations", error);
      }
    };
    success && Load();
  }, [loadConversations, success]);
  if (!success)
    return (
      <>
        <GeneralLoader />
      </>
    );
  return <>{children}</>;
};
export default DatabaseSetup;
