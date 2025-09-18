import { useCallback, useEffect, useState } from "react";

import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useChatStore } from "@/src/Store/chatStore";
import {
  AddMessageLocally,
  MediaItem,
  MessageStatus,
  SendMessageRequest,
} from "@/src/Types/message";
import * as Crypto from "expo-crypto";
import { SendHorizonal } from "lucide-react-native";
import { Keyboard } from "react-native";
import { GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, TextArea, View } from "tamagui";
import { useGetStoredMessages } from "../hooks/useGetStoredMessages";

const Chating = () => {
  const { ui, addPendingMessage } = useChatStore();
  if (!ui.currentChatId) throw new Error("No chat id found");
  const currentUserId = useGetCurrentUserId();
  const insets = useSafeAreaInsets();
  const { invoke } = useSignalRInvoke();
  const storedMessages = useGetStoredMessages(ui.currentChatId);
  const [messages, setMessages] = useState<IMessage[]>(storedMessages);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      try {
        if (ui.isFirstTime === false) {
          const messageToSend: SendMessageRequest = {
            clientId: Crypto.randomUUID(),
            senderId: currentUserId!,
            text: messages[0].text,
            media: [],
            conversationId: ui.currentChatId,
          };
          await invoke<SendMessageRequest>("sendMessage", messageToSend);
          const messageToStore: AddMessageLocally = {
            conversationId: messageToSend.conversationId!,
            senderId: messageToSend.senderId,
            clientId: messageToSend.clientId,
            media: messageToSend.media as unknown as MediaItem[],
            replyToMessageId: messageToSend.replyToMessageId,
            text: messageToSend.text,
            status: MessageStatus.Pending,
            createdAt: new Date().toISOString(),
          };
          addPendingMessage(messageToStore);
        } else {
          const messageToSend: SendMessageRequest = {
            clientId: Crypto.randomUUID(),
            senderId: currentUserId!,
            text: messages[0].text,
            media: [],
            receiverId: ui.currentChatId,
          };
          await invoke<SendMessageRequest>("sendMessage", messageToSend);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [currentUserId, invoke, ui.currentChatId, ui.isFirstTime, addPendingMessage]
  );

  return (
    <View
      flex={1}
      pb={
        keyboardVisible
          ? Keyboard.metrics()?.height! + insets.bottom + 5
          : insets.bottom
      }
      bg={"$black2"}
    >
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
          name: "User",
        }}
        showAvatarForEveryMessage={false}
        alwaysShowSend
        isKeyboardInternallyHandled={false}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: "#222",
              borderTopWidth: 0,
            }}
            renderSend={(props) => {
              const disabled = !props.text || props.text.trim().length === 0;
              return (
                <Button
                  height={"$6"}
                  bg={disabled ? "$accent10" : "$green6"}
                  icon={<SendHorizonal size={20} />}
                  onPress={() => {
                    if (props.text && props.onSend) {
                      props.onSend([{ text: props.text.trim() }], true);
                    }
                  }}
                  disabled={disabled}
                />
              );
            }}
          />
        )}
        renderComposer={(props) => (
          <TextArea
            placeholder="Type your message..."
            value={props.text}
            onChangeText={props.onTextChanged}
            bg="$black2"
            color="white"
            fontSize="$4"
            flex={1}
            rounded="$2"
            placeholderTextColor="#888"
            minH={60}
            maxH={140}
            py={5}
            borderWidth={2}
          />
        )}
      />
    </View>
  );
};

export default Chating;
