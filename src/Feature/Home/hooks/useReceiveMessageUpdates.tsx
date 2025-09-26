import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useSignalRListener } from "@/src/Hooks/useSignalRListener";
import { useChatStoreDb } from "@/src/Store/chatStoreDb";
import { UserContact } from "@/src/Types/contacts";
import {
  DeliveredMessagePayload,
  ReceivedMessagePayload,
} from "@/src/Types/message";
import { HubResponse } from "@/src/Types/shared";
import { useCallback } from "react";
import { Toast } from "toastify-react-native";

export const useReceiveMessageUpdates = () => {
  const {
    receiveMessage,
    conversationExist,
    addConversation,
    deliveredMessage,
  } = useChatStoreDb();
  const { invoke } = useSignalRInvoke();

  const handleIncomingMessage = useCallback(
    async function (message: ReceivedMessagePayload) {
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
            unreadCount: 0,
            status: data.status,
            name: data.name,
            photoUrl: data.photoUrl || null,
          });
          receiveMessage(message);
        } else {
          receiveMessage(message);
        }
      } catch (error) {
        console.log("error occurred in useReceiveMessage", error);
      }
    },
    [addConversation, conversationExist, invoke, receiveMessage]
  );
  useSignalRListener("OnMessageReceive", handleIncomingMessage);
  const onMessageFailure = useCallback(function (clientId: string) {
    Toast.error("Message failed to send" + clientId);
  }, []);
  useSignalRListener("OnMessageFailure", onMessageFailure);
  const onMessageDelivered = useCallback(
    (message: DeliveredMessagePayload) => {
      deliveredMessage({ ...message });
    },
    [deliveredMessage]
  );
  useSignalRListener("OnMessageDelivered", onMessageDelivered);
};
