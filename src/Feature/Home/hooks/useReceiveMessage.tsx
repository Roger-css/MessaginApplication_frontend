import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useSignalRListener } from "@/src/Hooks/useSignalRListener";
import { useChatStore } from "@/src/Store/chatStore";
import { UserContact } from "@/src/Types/contacts";
import { MessageStatus, ReceivedMessagePayload } from "@/src/Types/message";
import { HubResponse } from "@/src/Types/shared";
import { Toast } from "toastify-react-native";

const useReceiveMessage = () => {
  useSignalRListener("onmessagefailure", onMessageFailure);
  const { receiveMessage, conversationExist, addConversation } = useChatStore();
  const { invoke } = useSignalRInvoke();
  const handleIncomingMessage = async (message: ReceivedMessagePayload) => {
    console.log("incoming message received: ", message);
    console.log(
      `Stringified incoming message received: ${JSON.stringify(message)}`
    );

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
          messages: [{ ...message, status: MessageStatus.Read }],
          participants: [data],
          unreadCount: 0,
        });
      } else {
        receiveMessage(message);
      }
    } catch (error) {
      console.log("error occurred in useReceiveMessage", error);
    }
  };
  useSignalRListener("onmessagereceive", handleIncomingMessage);
  function onMessageFailure(clientId: string) {
    Toast.error("Message failed to send" + clientId);
  }
};
export default useReceiveMessage;
