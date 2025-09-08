import { axios } from "@/src/API/Base";
import { SendSmsRequest } from "@/src/Types/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useSendSms = () => {
  return useMutation<string, AxiosError, SendSmsRequest>({
    mutationFn: async (body) => {
      const { data } = await axios.post<string>("Auth/otp/send-sms", body);

      return data;
    },
    mutationKey: ["sendSms"],
  });
};
