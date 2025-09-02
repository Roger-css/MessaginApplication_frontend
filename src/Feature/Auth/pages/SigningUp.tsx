import { useSessionStore } from "@/src/Store/otpSessionStore";
import { router } from "expo-router";
import { OctagonAlert } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Separator, Text, YStack } from "tamagui";
import { Toast } from "toastify-react-native";
import { CountryCodePicker } from "../components/CountryCodePicker";
import { PhoneInput } from "../components/PhoneInput";
import { useSendSms } from "../hooks/useSendSms";
const Signup = () => {
  const [countryCode, setCountryCode] = useState("+964");
  const [phone, setPhone] = useState("");
  const { mutateAsync } = useSendSms();
  const setSession = useSessionStore((state) => state.setState);
  const onSubmit = async () => {
    try {
      const sessionId = await mutateAsync({ phoneNumber: phone, countryCode });
      setSession({
        countryCode: countryCode,
        number: phone,
        sessionId: sessionId,
      });
      router.push({
        pathname: "/(Auth)/OtpVerification",
      });
    } catch {
      Toast.error(
        `an error occurred while sending ur request please try again later`,
        "bottom",
        <OctagonAlert />
      );
    }
  };

  return (
    <YStack style={styles.container} bg={"$black2"}>
      <YStack>
        <YStack gap="$10" px="$4" py="$6">
          <YStack gap="$2">
            <Text fontSize={28} fontWeight="700">
              Sign in
            </Text>
            <Text color="$color" opacity={0.7}>
              Enter your phone number to continue
            </Text>
          </YStack>

          <YStack gap={"$12"}>
            <YStack gap="$2">
              <CountryCodePicker
                value={countryCode}
                onChange={setCountryCode}
              />
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="Phone number"
              />
            </YStack>
            <YStack>
              <Button
                bg={"$blue8"}
                aria-label={"Continue"}
                onPress={onSubmit}
                disabled={!phone}
                opacity={!phone ? 0.5 : 1}
                size={"$5"}
              >
                Continue
              </Button>
            </YStack>
          </YStack>
          <YStack gap={"$4"}>
            <Separator borderColor="$borderColor" />
            <Text color="$color" opacity={0.6} fontSize={12}>
              By continuing, you agree to our Terms and Privacy Policy.
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 100,
    paddingLeft: 20,
  },
});

export default Signup;
