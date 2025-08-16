import { useAxiosAuth } from "@/src/Hooks/useAuthenticatedInstance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useCreateProfile = () => {
  const axios = useAxiosAuth();
  const { mutateAsync } = useMutation<any, AxiosError, any>({
    mutationFn: async (data) => {
      return await axios.post("user/profile", data);
    },
  });
  return { createProfile: mutateAsync };
};
