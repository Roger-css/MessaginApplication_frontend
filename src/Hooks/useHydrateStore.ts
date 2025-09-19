import { useRef } from "react";
import { useChatStore } from "../Store/chatStore";

export const useHydrateStore = () => {
  const hydrate = useChatStore((state) => state.hydrate);
  const isFirstTime = useRef(true);
  if (isFirstTime.current) {
    hydrate();
    isFirstTime.current = false;
  }
};
