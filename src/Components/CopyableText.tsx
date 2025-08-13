import * as ClipBoard from "expo-clipboard";
import { Text, TextProps } from "tamagui";
const CopyableText = ({
  children,
  ...rest
}: {
  children?: string;
} & Partial<TextProps>) => {
  return (
    <Text
      {...rest}
      onLongPress={async () => {
        await ClipBoard.setStringAsync(children);
      }}
    >
      {children}
    </Text>
  );
};

export default CopyableText;
