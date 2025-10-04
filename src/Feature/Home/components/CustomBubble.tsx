import { bluePrimary, greenPrimary, grey } from "@/src/Constants/Colors";
import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import { Check, CheckCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Bubble, IMessage } from "react-native-gifted-chat";

// Extend IMessage to include seen property
export interface IMessageWithSeen extends IMessage {
  seen?: boolean;
}

interface CustomBubbleProps {
  currentMessage?: IMessageWithSeen;
  position?: "left" | "right";
  [key: string]: any;
}

const CustomBubble: React.FC<CustomBubbleProps> = (props) => {
  const { currentMessage, position } = props;

  const renderMessageStatus = () => {
    // Only show status for messages sent by current user (right side)
    if (position !== "right" || !currentMessage) return null;

    const { pending, sent, received, seen } = currentMessage;

    return (
      <View style={styles.statusContainer}>
        {pending && <Ionicons name="time-outline" size={16} color="#ffffff" />}
        {sent && !received && !seen && <Check size={16} color={grey} />}
        {received && !seen && <CheckCheck size={16} color={grey} />}
        {seen && <CheckCheck size={16} color={bluePrimary} />}
      </View>
    );
  };

  return (
    <Bubble
      {...props}
      currentMessage={currentMessage!}
      position={position!}
      renderTicks={() => renderMessageStatus()}
      wrapperStyle={{ right: { backgroundColor: greenPrimary } }}
    />
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 10,
    paddingTop: 2,
  },
});

export default CustomBubble;
