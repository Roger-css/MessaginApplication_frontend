import { Input, YStack } from "tamagui";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export function PhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
}: Props) {
  return (
    <YStack flex={1}>
      <Input
        keyboardType="phone-pad"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        background="Background"
        color="$color"
        borderColor="$borderColor"
        py="$0"
        style={{ borderRadius: 8 }}
        height={48}
        size={"$5"}
      />
    </YStack>
  );
}
