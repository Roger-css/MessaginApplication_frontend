import { useChatStore } from "@/src/Store/chatStore";
import { Message, MessageStatus } from "@/src/Types/message";
import { useRef, useState } from "react";
import { IMessage } from "react-native-gifted-chat";

export const useGetStoredMessages = (conversationId?: string) => {
  const conversations = useChatStore((state) => state.conversations);
  const [messages, setMessages] = useState<unknown[]>([]);
  const isFirstTime = useRef(true);
  const transformMessages = (messages: Message[]) => {
    if (messages === undefined) return [];
    return messages
      ?.map((message) => {
        const id = (message.id || message.clientId) as string;
        if (id === undefined) throw new Error("id is undefined");
        const modifiedMessage: IMessage = {
          _id: id,
          text: message.text || "",
          createdAt: new Date(message.createdAt),
          pending: message.status === MessageStatus.Pending,
          sent: message.status === MessageStatus.Sent,
          received:
            message.status === MessageStatus.Delivered ||
            message.status === MessageStatus.Read,
          user: {
            _id: message.senderId,
          },
        };
        return modifiedMessage;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };
  if (isFirstTime.current) {
    const storedMessages = conversations?.get(conversationId!)?.messages;
    console.log("stored conversations: ", conversations);
    console.log("#################################");
    console.log("Stored messages: ", storedMessages);
    setMessages(transformMessages(storedMessages ?? []));
    isFirstTime.current = false;
  }
  return messages as IMessage[];
};
