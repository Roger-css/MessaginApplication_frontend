import { DependencyList, useEffect } from "react";
import { useSignalRStore } from "../Store/signalRStore";

export const useSignalRListener = (
  eventName: string,
  handler: (...args: any[]) => void,
  deps?: DependencyList
): void => {
  const { connection } = useSignalRStore();

  useEffect(() => {
    if (connection) {
      connection.on(eventName, handler);
      console.log("listener added: ", eventName);
      return () => {
        console.log("listener removed: ", eventName);

        connection.off(eventName, handler);
      };
    }
  }, [connection, eventName, handler, deps]);
};
