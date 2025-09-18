import { Conversation, useChatStore } from "@/src/Store/chatStore";
import { router } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { FormatChatDate } from "../utils/DateHumanizer";
type ContactProps = {
  props: Conversation;
  url: string;
  firstTime: boolean;
};
const Contact = ({ props, url, firstTime }: ContactProps) => {
  const touchX = useSharedValue(0);
  const rippleWidth = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const longPress = Gesture.LongPress()
    .onTouchesMove(() => {
      rippleWidth.value = 0;
      rippleOpacity.value = 0;
    })
    .onBegin((e) => {
      touchX.value = e.x;
      // Reset and start animation (slightly different for long press)
      rippleWidth.value = 0;
      rippleOpacity.value = 0.15;
      rippleWidth.value = withDelay(
        50,
        withTiming(800, {
          duration: 550,
          easing: Easing.out(Easing.quad),
        })
      );

      rippleOpacity.value = withDelay(
        50,
        withTiming(0, {
          duration: 550,
          easing: Easing.out(Easing.quad),
        })
      );
    });

  const composedGesture = Gesture.Race(longPress);

  // Ripple animation that starts thin and expands to full width
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      height: 70, // Same height as chat item
      width: rippleWidth.value,
      backgroundColor: "#ffffffff",
      opacity: rippleOpacity.value,
      left: touchX.value,
      top: 0,
      pointerEvents: "none",
      borderRadius: 0,
      transform: [{ translateX: `${-50}%` }],
    };
  });
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation
  );
  const onPress = async () => {
    setActiveConversation({
      isFirstTime: firstTime,
      currentChatId: url,
    });
    router.push(`/(home)/chat`);
  };
  return (
    <GestureDetector gesture={composedGesture}>
      <XStack
        gap="$3"
        bg="$black3"
        height={70}
        flex={1}
        justify="flex-start"
        items="center"
        p={4}
        px="$2"
        rounded={0}
        position="relative"
        overflow="hidden"
        onPress={onPress}
      >
        {/* Ripple effect layer */}
        <Animated.View style={rippleAnimatedStyle} />

        {props.photoUrl ? (
          <Avatar size="$5" circular>
            <Avatar.Image source={{ uri: props.photoUrl }} objectFit="cover" />
            <Avatar.Fallback delayMs={300} bg="green" />
          </Avatar>
        ) : (
          <Avatar size="$5" circular bg={"$green5"}>
            <Text>{props.name?.charAt(0)}</Text>
          </Avatar>
        )}

        <YStack gap="$1" flex={1}>
          <Text>{props.name}</Text>
          <Text fontSize="$2" color="$black11" numberOfLines={1}>
            {props.lastMessage?.text || "say hi"}
          </Text>
        </YStack>

        <View
          height="100%"
          flex={0}
          shrink={0}
          justify="flex-start"
          items="flex-start"
        >
          <Text color="$black10" fontSize={10} numberOfLines={1}>
            {props.lastMessage?.createdAt &&
              FormatChatDate(props.lastMessage?.createdAt)}
          </Text>
        </View>
      </XStack>
    </GestureDetector>
  );
};

export default Contact;
