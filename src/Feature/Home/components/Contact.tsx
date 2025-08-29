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
import { Chat } from "../utils/Data";
import { FormatChatDate } from "../utils/DateHumanizer";

const Contact = ({ props }: { props: Chat }) => {
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

      // Slower expansion for long press
      rippleWidth.value = withDelay(
        50,
        withTiming(800, {
          duration: 550,
          easing: Easing.out(Easing.quad),
        })
      );

      // Longer fade for long press
      rippleOpacity.value = withDelay(
        50,
        withTiming(0, {
          duration: 1050,
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
      backgroundColor: "#ffffffff", // Dark ripple for light theme, adjust as needed
      opacity: rippleOpacity.value,
      left: touchX.value, // Center on touch point
      top: 0,
      pointerEvents: "none",
      borderRadius: 0, // No border radius for rectangular ripple
      transform: [{ translateX: `${-50}%` }],
    };
  });

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
        onPress={() => router.push("/(home)/chat/1")}
      >
        {/* Ripple effect layer */}
        <Animated.View style={rippleAnimatedStyle} />

        <Avatar size="$5">
          <Avatar.Image
            source={{ uri: props.picture }}
            borderRadius={100}
            objectFit="cover"
          />
          <Avatar.Fallback delayMs={300} bg="grey" />
        </Avatar>

        <YStack gap="$1" flex={1}>
          <Text>{props.name}</Text>
          <Text fontSize="$2" color="$black11" numberOfLines={1}>
            {props.lastMessage}
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
            {FormatChatDate(props.date)}
          </Text>
        </View>
      </XStack>
    </GestureDetector>
  );
};

export default Contact;
