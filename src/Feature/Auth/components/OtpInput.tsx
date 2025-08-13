import { useRef } from "react";
import { TextInput } from "react-native";
import { Input, XStack } from "tamagui";

type Props = {
  value: string;
  onChange: (val: string) => void;
  length?: number;
};

export function OtpInput({ value, onChange, length = 6 }: Props) {
  // Create array of refs using useRef
  const refs = useRef<(TextInput | null)[]>(Array.from({ length }, () => null));

  const onChangeDigit = (digit: string, idx: number) => {
    const clean = digit.replace(/[^0-9]/g, "");

    if (clean.length === 0) {
      // Handle deletion
      const next = value.substring(0, idx) + "" + value.substring(idx + 1);
      onChange(next);
      if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
      return;
    }

    // Handle input
    const char = clean[0];
    const next = (
      value.substring(0, idx) +
      char +
      value.substring(idx + 1)
    ).slice(0, length);

    onChange(next);

    // Move to next input or blur if last
    if (idx < length - 1) {
      refs.current[idx + 1]?.focus();
    } else {
      refs.current[idx]?.blur();
    }
  };

  const onKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <XStack gap="$2" items="center" justify="center" width="100%">
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] ?? "";
        const active = Boolean(char);
        return (
          <Input
            key={idx}
            ref={(ref) => {
              refs.current[idx] = ref as TextInput | null;
            }}
            value={char}
            onChangeText={(text) => onChangeDigit(text, idx)}
            onKeyPress={(e) => onKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            text="center"
            fontSize={20}
            fontWeight="700"
            width={48}
            height={56}
            background="$black4"
            color="$color"
            borderColor={active ? "$accentBackground" : "$borderColor"}
            borderWidth={2}
            style={{ borderRadius: 8 }}
            focusStyle={{ borderColor: "$accentBackground" }}
            p={0}
          />
        );
      })}
    </XStack>
  );
}
