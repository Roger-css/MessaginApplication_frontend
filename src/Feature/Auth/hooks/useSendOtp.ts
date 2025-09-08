import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { AuthResponse, SendOtpVerificationRequest } from "@/src/Types/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useSendOtp = () => {
  const axios = useAxiosAuth();

  return useMutation<AuthResponse, AxiosError, SendOtpVerificationRequest>({
    mutationFn: async (body) => {
      const { data } = await axios.post<AuthResponse>("Auth/otp/verify", body);
      return data;
    },
  });
};
