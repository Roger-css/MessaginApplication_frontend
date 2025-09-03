import React, { useCallback, useEffect, useState } from "react";

import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { useSignalRListener } from "@/src/Hooks/useSignalRListener";
import {
  ReceivedMessagePayload,
  SendMessageRequest,
} from "@/src/Types/Message";
import { Send } from "lucide-react-native";
import { Keyboard } from "react-native";
import { GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, TextArea, View } from "tamagui";
import { Toast } from "toastify-react-native";
type Props = {
  userId: string;
};
const Chating = (props: Props) => {
  const insets = useSafeAreaInsets();
  const { invoke } = useSignalRInvoke();
  useSignalRListener("OnMessageReceive", onMessageReceive);
  useSignalRListener("OnMessageFailure", onMessageFailure);
  function onMessageReceive(payload: ReceivedMessagePayload) {
    const message: IMessage[] = [
      {
        _id: payload.id,
        createdAt: new Date(payload.createdAt),
        text: payload.text || "",
        user: { _id: 2 },
      },
    ];
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, message)
    );
  }
  function onMessageFailure(clientId: string) {
    Toast.error("Message failed to send" + clientId);
  }
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hello developer",
      createdAt: new Date(),
      user: { _id: 2 },
    },
  ]);

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
      messages[0].pending = true;
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      // const payload: SendMessageRequest = {
      //   clientId: crypto.randomUUID(),
      //   senderId:
      // };
      await invoke<SendMessageRequest>("sendMessage");
    },
    [invoke]
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
            renderSend={() => {
              return (
                <Button
                  height={"$6"}
                  bg={"$green6"}
                  icon={<Send size={20} />}
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

export default React.memo(Chating);
