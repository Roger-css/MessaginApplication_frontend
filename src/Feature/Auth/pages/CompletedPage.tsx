import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";
const CompletedPage = () => {
  const Continue = () => {
    // router.replace("")
  };

  return (
    <YStack
      bg={"$blue2"}
      flex={1}
      items="center"
      justify="flex-start"
      gap={"$8"}
      pt={"$14"}
    >
      <Image
        source={require("@/assets/images/Domain/verified.svg")}
        style={styles.image}
        contentFit="contain"
        alt="Verification Completed"
      />
      <Text color={"white"} fontSize={16} text={"center"} fontWeight="700">
        Your phone number has been successfully verified!
      </Text>
      <XStack px={"$4"}>
        <Button theme={"blue"} size={"$7"} width={"100%"} onPress={Continue}>
          <Text>Continue</Text>
        </Button>
      </XStack>
    </YStack>
  );
};
const styles = StyleSheet.create({
  image: { width: 130, height: 130, borderRadius: 20 },
});
export default CompletedPage;
