import { useCallback } from "react";
import { useSignalRStore } from "../Store/signalRStore";

export const useSignalRInvoke = () => {
  const { connection, isConnected, setError } = useSignalRStore();

  const invoke = useCallback(
    async <T, R>(
      methodName: string,
      argument?: T,
      ...additionalArgs: any[]
    ) => {
      if (!isConnected || !connection) {
        throw new Error("SignalR connection is not established");
      }
      try {
        if (argument)
          return await connection.invoke<R>(
            methodName,
            argument,
            ...additionalArgs
          );
        return await connection.invoke(methodName);
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
