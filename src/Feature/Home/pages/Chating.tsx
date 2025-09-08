import { useCallback, useEffect, useState } from "react";

import { useGetCurrentUserId } from "@/src/Hooks/useGetCurrentUserId";
import { useSignalRInvoke } from "@/src/Hooks/useSignalRInvoke";
import { SendMessageRequest } from "@/src/Types/message";
import { SendHorizonal } from "lucide-react-native";
import { Keyboard } from "react-native";
import { GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, TextArea, View } from "tamagui";
type Props = {
  conversationId: string;
};
const Chating = (props: Props) => {
  const currentUserId = useGetCurrentUserId();
  const insets = useSafeAreaInsets();
  const { invoke } = useSignalRInvoke();

  const [messages, setMessages] = useState<IMessage[]>([]);
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
      const messageToSend: SendMessageRequest = {
        clientId: crypto.randomUUID(),
        senderId: currentUserId!,
        text: messages[0].text,
        media: [],
        conversationId: props.conversationId,
      };
      await invoke<SendMessageRequest>("sendMessage", messageToSend);
    },
    [currentUserId, invoke, props.conversationId]
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
                  icon={<SendHorizonal size={20} />}
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
