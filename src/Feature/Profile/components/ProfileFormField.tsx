import { useId } from "react";
import { type Control, Controller, type FieldPath } from "react-hook-form";
import { Input, Label, Text, XStack, YStack } from "tamagui";
import type { ProfileFormData } from "../utils/SchemaValidation";

type ProfileFormFieldProps = {
  label?: string;
  name: FieldPath<ProfileFormData>;
  control: Control<ProfileFormData>;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
};

export const ProfileFormField = ({
  label,
  name,
  control,
  placeholder,
  multiline = false,
  maxLength,
}: ProfileFormFieldProps) => {
  const id = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <YStack gap="$2" bg="$black2" rounded="$2">
          {label && (
            <Label htmlFor={id} color="$accent1" fontSize="$4" fontWeight="600">
              {label}
            </Label>
          )}

          <Input
            id={id}
            value={(value as string) || ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            maxLength={maxLength}
            focusStyle={{ borderColor: "$accent6" }}
            bg="$black2"
            borderColor={error ? "$red8" : "$black10"}
            color="white"
            fontSize="$4"
            rounded="$2"
            py={"$0"}
          />

          <XStack>
            {
              <Text width={"70%"} fontSize="$3" color="$red10">
                {error ? error.message : ""}
              </Text>
            }
            {maxLength && (
              <Text
                fontSize="$2"
                color="$black10"
                self="flex-start"
                text={"right"}
                width={"30%"}
              >
                {((value as string) || "").length}/{maxLength}
              </Text>
            )}
          </XStack>
        </YStack>
      )}
    />
  );
};
