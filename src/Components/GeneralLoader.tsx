import { Spinner, View } from "tamagui";

const GeneralLoader = () => {
  return (
    <View display="flex" items="center" justify="center" height={"100%"}>
      <Spinner size="large" color="$green10" />
    </View>
  );
};

export default GeneralLoader;
