import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { Chat } from "../utils/Data";
import { FormatChatDate } from "../utils/DateHumanizer";

const Contact = ({ props }: { props: Chat }) => {
  return (
    <XStack gap={"$3"} my={"$2"}>
      <Avatar width={"$8"}>
        <Avatar.Image
          source={{ uri: props.picture }}
          borderRadius={100}
          objectFit="cover"
        />
      </Avatar>
      <YStack gap={"$1"}>
        <Text>{props.name}</Text>
        <Text fontSize={"$2"}>{props.lastMessage.substring(0, 20)}...</Text>
      </YStack>
      <View flex={1} justify={"flex-end"} items={"center"}>
        <Text fontSize={"$1"}>{FormatChatDate(props.date)}</Text>
      </View>
    </XStack>
  );
};

export default Contact;
