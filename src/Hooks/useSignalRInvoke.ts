import { useCallback } from "react";
import { useSignalRStore } from "../Store/signalRStore";

export const useSignalRInvoke = () => {
  const { connection, isConnected, setError } = useSignalRStore();

  const invoke = useCallback(
    async <T>(
      methodName: string,
      argument?: T,
      ...additionalArgs: any[]
    ): Promise<void> => {
      if (!isConnected || !connection) {
        throw new Error("SignalR connection is not established");
      }

      try {
        await connection.invoke(methodName, argument, ...additionalArgs);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        throw error;
      }
    },
    [connection, isConnected, setError]
  );

  return { invoke };
};
