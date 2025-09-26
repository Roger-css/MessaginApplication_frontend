import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { Text, View } from "tamagui";
const NotFoundScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! An error occurred" }} />
      <View style={styles.container}>
        <Link href="/(home)/(tabs)/Index" asChild>
          <Text>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
};
export default NotFoundScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});
