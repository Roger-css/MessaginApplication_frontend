import COUNTRIES, { Country } from "country-list-with-dial-code-and-flag";
import { useRef, useState } from "react";
import { FlatList, Keyboard, Modal, Pressable, StyleSheet } from "react-native";
import { Button, Input, Text, XStack, YStack } from "tamagui";
type Props = {
  value: string;
  onChange: (val: string) => void;
};

export function CountryCodePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("+1");
  const isClosing = useRef(false);

  const data = COUNTRIES.getAll().filter((c) => {
    return c.dialCode.includes(query);
  });

  const select = (c: Country) => {
    onChange(c.dialCode);
    setOpen(false);
  };
  const closeModal = () => {
    if (isClosing.current) {
      console.log("closeModal ignored due to debounce");
      return;
    }
    isClosing.current = true;
    const isVisible = Keyboard.isVisible();
    if (isVisible) {
      Keyboard.dismiss();
    } else {
      setOpen(false);
    }

    setTimeout(() => {
      isClosing.current = false;
    }, 100);
  };
  return (
    <>
      <Button
        onPress={() => setOpen(true)}
        background="$backgroundStrong"
        borderWidth={1}
        borderColor="$borderColor"
        px="$3"
        py="$1"
        height={48}
        width={"40%"}
      >
        <Text color="$color" fontWeight="700">
          {COUNTRIES.findOneByDialCode(value)?.flag} {value}
        </Text>
      </Button>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <YStack
              bg="$background"
              py="$4"
              px="$3"
              gap="$3"
              borderTopLeftRadius={20}
              borderTopRightRadius={20}
              overflow="hidden"
            >
              <Text fontSize={18} fontWeight="700">
                Select country
              </Text>
              <Input
                placeholder="Search country or code"
                value={query}
                onChangeText={setQuery}
                background="$backgroundStrong"
                color="$color"
                borderColor="$borderColor"
                boxSizing="border-box"
                height={64}
              />
              <YStack maxH={270}>
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.name + item.countryCode}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <Pressable onPress={() => select(item)}>
                      <XStack
                        verticalAlign="center"
                        justify="space-between"
                        py="$3"
                        px="$2"
                      >
                        <XStack verticalAlign="center" gap="$3">
                          <Text fontSize={20}>{item.flag}</Text>
                          <Text color="$color">{item.name}</Text>
                        </XStack>
                        <Text color="$color" opacity={0.7} fontWeight="700">
                          {item.countryCode}
                        </Text>
                      </XStack>
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => (
                    <YStack height={1} bg="$borderColor" />
                  )}
                />
              </YStack>
              <Button
                onPress={() => setOpen(false)}
                background="$backgroundStrong"
                borderColor="$borderColor"
                borderWidth={1}
              >
                Close
              </Button>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
});
