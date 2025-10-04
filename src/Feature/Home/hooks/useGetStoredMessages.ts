import { useChatStoreDb } from "@/src/Store/chatStoreDb";
import { MessageStatus } from "@/src/Types/message";
import { useEffect, useMemo } from "react";
import { IMessage } from "react-native-gifted-chat";

export const useConversationMessages = (conversationId: string) => {
  const { loadMessages, cachedConversations } = useChatStoreDb();
  useEffect(() => {
    const load = async () => {
      await loadMessages(conversationId);
    };
    load();
  }, [conversationId, loadMessages]);

  const messagesData = useMemo(
    () => cachedConversations[conversationId]?.messages,
    [cachedConversations, conversationId]
  );
  const transformedMessages: (IMessage & { seen?: boolean })[] = useMemo(
    () =>
      messagesData
        ? messagesData
            .map<IMessage & { seen?: boolean }>((message) => {
              const id = (message.id || message.clientId) as string;
              if (!id) throw new Error("Message id is undefined");
              return {
                _id: id,
                text: message.text || "",
                createdAt: new Date(message.createdAt),
                pending: message.status === MessageStatus.Pending,
                sent: message.status > MessageStatus.Pending,
                received: message.status > MessageStatus.Sent,
                seen: message.status === MessageStatus.Read,
                user: {
                  _id: message.senderId,
                },
              };
            })
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
        : [],
    [messagesData]
  );
  return transformedMessages;
};
