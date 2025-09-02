import { useAuthStore } from "@/src/Store/authStore";
import { useSessionStore } from "@/src/Store/otpSessionStore";
import { router } from "expo-router";
import { OctagonAlert } from "lucide-react-native";
import { useState } from "react";
import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { Toast } from "toastify-react-native";
import { OtpInput } from "../components/OtpInput";
import { useSendOtp } from "../hooks/useSendOtp";

export default function OtpScreen() {
  const countryCode = useSessionStore((s) => s.countryCode);
  const phone = useSessionStore((s) => s.number);
  const sessionId = useSessionStore((s) => s.sessionId);

  const [otp, setOtp] = useState("");
  const { mutateAsync } = useSendOtp();

  const setAuth = useAuthStore((state) => state.setAuth);

  const onVerify = async () => {
    if (otp.length !== 6 || !countryCode || !phone || !sessionId) {
      router.back();
    }
    try {
      const data = await mutateAsync({
        countryCode: countryCode!,
        number: phone!,
        sessionId: sessionId!,
        otp: +otp,
      });
      const { token, result, error } = data;
      if (result) {
        setAuth({ access: token!, refresh: null });
        router.replace({
          pathname: "/(Auth)/Completed",
          params: { afterAuth: "true" },
        });
      } else {
        Toast.error(error!.join(", "));
      }
    } catch {
      Toast.error(
        `an error occurred while sending ur request please try again later`,
        "bottom",
        <OctagonAlert />
      );
    }
  };

  return (
    <YStack bg={"$black2"} height={"100%"}>
      <YStack gap="$4" px="$4" py="$10">
        <YStack gap="$2" mb="$8">
          <Text fontSize={24} fontWeight="700">
            Enter the code
          </Text>
          <Text color="$color" opacity={0.7}>
            We sent a 6-digit code to
          </Text>
          <Text fontWeight="700" color="$color">
            {countryCode}
            {phone}
          </Text>
        </YStack>

        <XStack>
          <OtpInput value={otp} onChange={setOtp} length={6} />
        </XStack>

        <YStack mt="$4">
          <Button
            bg={"$blue8"}
            aria-label={"Verify"}
            onPress={onVerify}
            disabled={otp.length !== 6}
            opacity={otp.length !== 6 ? 0.5 : 1}
            size={"$5"}
          >
            Verify
          </Button>
        </YStack>

        <YStack mt="$2" gap={"$8"}>
          <Text color="$color">
            Didn&apos;t receive the code? Wait a moment and try again.
          </Text>
          <Paragraph opacity={0.7}>
            For testing purposes, you can use 111111 as the OTP code.
          </Paragraph>
        </YStack>
      </YStack>
    </YStack>
  );
}
