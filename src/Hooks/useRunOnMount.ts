import { useRef } from "react";

export const useRunOnMount = (callback: () => void) => {
  const isFirstTime = useRef(true);
  if (isFirstTime.current) {
    callback();
    isFirstTime.current = false;
  }
};
