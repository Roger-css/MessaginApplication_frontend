import { axios } from "@/src/API/Base";
import { useAuthStore } from "@/src/Store/authStore";

import { useSessionStore } from "@/src/Store/otpSessionStore";
import { AuthResponse } from "@/src/Types/Auth";
import { CreateProfileRequest } from "@/src/Types/User";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import mime from "mime";
import { ProfileFormData } from "../utils/SchemaValidation";
export const useCreateProfile = () => {
  const FormData = global.FormData;
  const accessToken = useAuthStore((state) => state.accessToken);
  const countryCode = useSessionStore((s) => s.countryCode);
  const number = useSessionStore((s) => s.number);
  const sessionId = useSessionStore((s) => s.sessionId);
  const transformObjectToFormData = async (
    data: ProfileFormData
  ): Promise<FormData> => {
    const requestData: CreateProfileRequest = {
      sessionId: sessionId!,
      number: number!,
      countryCode: countryCode!,
      name: data.name,
      bio: data.bio,
      userName: data.username,
    };
    const formdata = new FormData();
    Object.keys(requestData).forEach((key) => {
      if (requestData[key] !== undefined)
        formdata.append(key, requestData[key]);
    });
    if (data.profileImageUri !== undefined) {
      const uri = data.profileImageUri;
      const fileName = uri.split("/").pop() ?? "photo.jpg";
      const extension = mime.getType(fileName);
      formdata.append("picture", {
        uri,
        type: extension,
        name: fileName,
      } as any);
    }
    return formdata;
  };
  const { mutateAsync, ...rest } = useMutation<
    AuthResponse,
    AxiosError,
    ProfileFormData
  >({
    mutationFn: async (data) => {
      if (!sessionId || !number || !countryCode) {
        throw new Error("SessionId missing");
      }
      const body = await transformObjectToFormData(data);
      const response = await axios.post("User/profile", body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
  return { createProfile: mutateAsync, ...rest };
};
