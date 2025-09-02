import Chating from "@/src/Feature/Home/pages/Chating";
import { useLocalSearchParams } from "expo-router";

const Chat = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Chating userId={id} />;
};

export default Chat;
