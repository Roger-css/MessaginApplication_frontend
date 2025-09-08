import { Text, View } from "tamagui";

const EmptyPage = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <View flex={1} justify={"center"} items="center" height={"100%"}>
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && <Text>You have no one :(</Text>}
    </View>
  );
};
export default EmptyPage;
