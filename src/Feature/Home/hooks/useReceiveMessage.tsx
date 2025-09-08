import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useSignalRListener } from "@/src/Hooks/useSignalRListener";
import { useChatStore } from "@/src/Store/chatStore";
import { UserContact } from "@/src/Types/contacts";
import { ReceivedMessagePayload } from "@/src/Types/message";
import { HubResponse } from "@/src/Types/shared";
import { Toast } from "toastify-react-native";

const useReceiveMessage = () => {
  useSignalRListener("OnMessageFailure", onMessageFailure);
  const { addMessage, conversationExist, addConversation } = useChatStore();
  const { invoke } = useSignalRInvoke();
  const handleIncomingMessage = async (message: ReceivedMessagePayload) => {
    try {
      const { conversationId } = message;
      if (!conversationExist(conversationId)) {
        const { data, success } = await invoke<
          string,
          HubResponse<UserContact>
        >("GetConversationInfo", conversationId);
        if (!success) return;
        addConversation({
          id: data.conversationId,
          lastMessage: message,
          messages: [message],
          participants: [data],
          unreadCount: 0,
        });
      } else {
        addMessage(message);
      }
      // 2. Add message to state
    } catch (error) {
      console.log(error);
    }
  };
  useSignalRListener("OnMessageReceive", handleIncomingMessage);
  function onMessageFailure(clientId: string) {
    Toast.error("Message failed to send" + clientId);
  }
};
export default useReceiveMessage;
