import { useCallback, useEffect, useState } from "react";

import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { useRunOnMount } from "@/src/Hooks/useRunOnMount";
import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useChatStoreDb } from "@/src/Store/chatStoreDb";
import {
  AddMessageLocally,
  MediaItem,
  MessageReadRequest,
  SendMessageRequest,
} from "@/src/Types/message";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import { Keyboard } from "react-native";
import { GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, TextArea, View } from "tamagui";
import CustomBubble from "../components/CustomBubble";
import { useConversationMessages } from "../hooks/useGetStoredMessages";

const Chating = () => {
  const { addPendingMessage, ui, removeActiveConversation } = useChatStoreDb();
  const dbMessages = useConversationMessages(ui.currentChatId!);
  console.log("text: ", dbMessages[0]?.text);
  console.log("seen: ", dbMessages[0]?.seen);

  if (!ui.currentChatId) throw new Error("No chat id found");
  const currentUserId = useGetCurrentUserId();

  const insets = useSafeAreaInsets();
  const { invoke } = useSignalRInvoke();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const markAsRead = async () => {
    if (ui.isFirstTime) return;
    try {
      const messages = dbMessages
        .filter((e) => e.user._id !== currentUserId)
        .map((message) => ({
          conversationId: ui.currentChatId!,
          messageId: message._id as string,
        }));
      if (messages.length === 0) return;
      await invoke<MessageReadRequest>("MarkMessagesAsRead", {
        messages: messages,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useRunOnMount(markAsRead);
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
      const messageToSend: SendMessageRequest = {
        clientId: Crypto.randomUUID(),
        senderId: currentUserId!,
        text: messages[0].text,
        media: [],
        conversationId: ui.currentChatId,
      };
      const messageToStore: AddMessageLocally = {
        conversationId: messageToSend.conversationId!,
        senderId: messageToSend.senderId,
        clientId: messageToSend.clientId,
        media: messageToSend.media as unknown as MediaItem[],
        replyToMessageId: messageToSend.replyToMessageId,
        text: messageToSend.text,
        createdAt: new Date().toISOString(),
      };
      try {
        if (ui.isFirstTime === false) {
          addPendingMessage(messageToStore);
          await invoke<SendMessageRequest>("sendMessage", messageToSend);
        } else {
          messageToSend.receiverId = ui.currentChatId;
          messageToSend.conversationId = undefined;
          await invoke<SendMessageRequest>("sendMessage", messageToSend);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [currentUserId, ui.currentChatId, ui.isFirstTime, addPendingMessage, invoke]
  );
  useFocusEffect(
    useCallback(() => {
      return removeActiveConversation;
    }, [removeActiveConversation])
  );
  return (
    <View
      flex={1}
      pb={
        keyboardVisible
          ? Keyboard.metrics()?.height! + insets.bottom + 5
          : insets.bottom
      }
      pt={insets.top}
      bg={"$black2"}
    >
      <GiftedChat
        messages={dbMessages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUserId || 1,
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
        renderBubble={(props) => <CustomBubble {...props} />}
      />
    </View>
  );
};

export default Chating;
