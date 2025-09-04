import { useEffect } from "react";
import { useAuthStore } from "../Store/authStore";
import { useSignalRInvoke } from "./useSignalRInvoke";

export const useGetCurrentUserId = () => {
  const id = useAuthStore((state) => state.user?.id);
  const setUser = useAuthStore((state) => state.setUser);
  const { invoke } = useSignalRInvoke();
  useEffect(() => {
    const get = async () => {
      try {
        const id = await invoke<undefined, string>("GetCurrentUserId");
        setUser({ id });
      } catch {
        console.log("Error getting user id");
      }
    };
    if (id === undefined || id === null) get();
  }, [id, invoke, setUser]);
  return id;
};
